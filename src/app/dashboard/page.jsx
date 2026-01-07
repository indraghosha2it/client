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
// const API_BASE_URL = 'http://localhost:5004/api';

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








// 2

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
//   Tag,
//   AlertCircle
// } from 'lucide-react';

// // API base URL
// const API_BASE_URL = 'http://localhost:5004/api';

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

//   // Format currency in BDT (Taka)
//   const formatCurrency = (amount) => {
//     if (amount === undefined || amount === null) return 'BDT 0';
    
//     // Format with BDT symbol and proper number formatting
//     const formattedAmount = new Intl.NumberFormat('en-BD', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     }).format(amount);
    
//     return `BDT ${formattedAmount}`;
//   };

//   // Format currency without symbol (for display where needed)
//   const formatAmount = (amount) => {
//     if (amount === undefined || amount === null) return '0.00';
    
//     return new Intl.NumberFormat('en-BD', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     }).format(amount);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       {/* Header */}
//       <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Expense Dashboard</h1>
//           <p className="text-gray-600 mt-2">Track and analyze your office expenses in BDT (Taka)</p>
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
//                   <p className="text-gray-600 text-sm mt-2">Total Monthly Expenses (BDT)</p>
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
//                       <span>BDT {formatAmount(item.amount)}</span>
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
//                   <p className="text-gray-600 text-sm mt-2">Total Yearly Expenses (BDT)</p>
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
//                     <div className="text-xs text-gray-500 mt-1">
//                       BDT {formatAmount(month.total)}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Yearly Category Totals */}
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Yearly Category Totals (BDT)</h3>
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
//                     <div className="text-sm text-gray-500 mt-1">
//                       BDT {formatAmount(item.amount)}
//                     </div>
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
//           <h2 className="text-xl font-bold text-gray-900">Recent Expenses (Past 30 Days)</h2>
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
//                     {expense.date.toLocaleDateString('en-BD', { 
//                       day: 'numeric',
//                       month: 'short',
//                       year: 'numeric'
//                     })}
//                   </p>
//                 </div>
//                 <div className="text-right">
//                   <span className="text-xl font-bold text-gray-900 block">
//                     {formatCurrency(expense.amount)}
//                   </span>
//                   <span className="text-sm text-gray-500 block">
//                     BDT {formatAmount(expense.amount)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
          
//           {dashboardData.recentExpenses.length === 0 && (
//             <div className="text-center py-8 text-gray-500">
//               No recent expenses found in the past 30 days
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
//             <span className="text-sm text-gray-500 mt-1">Record new cost in BDT</span>
//           </button>

//           <button 
//             onClick={() => {
//               // Generate report functionality
//               const month = MONTHS[dashboardData.selectedMonth - 1];
//               const year = dashboardData.selectedYear;
//               alert(`Generating BDT expense report for ${month} ${year}...`);
//             }}
//             className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
//           >
//             <div className="p-3 bg-green-100 rounded-full mb-3 group-hover:bg-green-200">
//               <Download className="w-8 h-8 text-green-600" />
//             </div>
//             <span className="font-semibold text-gray-900">Generate Report</span>
//             <span className="text-sm text-gray-500 mt-1">Monthly PDF (BDT)</span>
//           </button>

//           <button 
//             onClick={() => window.location.href = '/dashboard/analytics'}
//             className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
//           >
//             <div className="p-3 bg-purple-100 rounded-full mb-3 group-hover:bg-purple-200">
//               <BarChart3 className="w-8 h-8 text-purple-600" />
//             </div>
//             <span className="font-semibold text-gray-900">View Analytics</span>
//             <span className="text-sm text-gray-500 mt-1">Trends & insights in BDT</span>
//           </button>

//           <button 
//             onClick={() => window.location.href = '/dashboard/categories'}
//             className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
//           >
//             <div className="p-3 bg-orange-100 rounded-full mb-3 group-hover:bg-orange-200">
//               <Tag className="w-8 h-8 text-orange-600" />
//             </div>
//             <span className="font-semibold text-gray-900">Manage Categories</span>
//             <span className="text-sm text-gray-500 mt-1">Add/Edit expense categories</span>
//           </button>
//         </div>
//       </div>

     
//     </div>
//   );
// }







// 2
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
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
//   Tag,
//   AlertCircle,
//   Users,
//   Building,
//   Home,
//   Shield,
//   LogOut,
//   Menu,
//   X,
//   Settings,
//   User,
//   Bell
// } from 'lucide-react';

// // API base URL
// const API_BASE_URL = 'http://localhost:5004/api';

// // Months for dropdown
// const MONTHS = [
//   'January', 'February', 'March', 'April', 'May', 'June',
//   'July', 'August', 'September', 'October', 'November', 'December'
// ];

// export default function DashboardPage() {
//   const router = useRouter();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

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

//   // Check authentication on mount
//   useEffect(() => {
//     checkAuthentication();
//   }, []);

//   // Generate year options (last 5 years + current year + next year)
//   const currentYear = new Date().getFullYear();
//   const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

//   // Check if user is authenticated
//   const checkAuthentication = () => {
//     const userData = localStorage.getItem('user');
//     const isAuth = localStorage.getItem('isAuthenticated');
    
//     if (!userData || !isAuth) {
//       router.push('/');
//       return;
//     }
    
//     try {
//       const parsedUser = JSON.parse(userData);
//       setUser(parsedUser);
//       setLoading(false);
      
//       // Fetch data after authentication check
//       fetchMonthlySummary();
//       fetchYearlySummary();
//       fetchRecentExpenses();
//     } catch (error) {
//       console.error('Error parsing user data:', error);
//       router.push('/');
//     }
//   };

//   // Handle logout
//   const handleLogout = async () => {
//     try {
//       // Call logout API
//       await fetch(`${API_BASE_URL}/auth/logout`, {
//         method: 'POST',
//         credentials: 'include'
//       });
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
    
//     // Clear local storage
//     localStorage.removeItem('user');
//     localStorage.removeItem('auth_token');
//     localStorage.removeItem('isAuthenticated');
    
//     // Redirect to login page
//     router.push('/');
//   };

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

//   // Navigation menu items based on user role
//   const getMenuItems = () => {
//     const baseItems = [
//       { name: 'Dashboard', icon: Home, href: '/dashboard', current: true },
//       { name: 'Bills & Utilities', icon: FileText, href: '/bills', current: false },
//       { name: 'Office Rent', icon: Building, href: '/office-rents', current: false },
//       { name: 'Office Supplies', icon: Tag, href: '/office-supplies', current: false },
//       { name: 'Transport Expenses', icon: TrendingUp, href: '/transport-expenses', current: false },
//       { name: 'Extra Expenses', icon: TrendingDown, href: '/extra-expenses', current: false },
//     ];

//     // Add admin-only items
//     if (user?.role === 'admin') {
//       baseItems.splice(1, 0, { name: 'Employee Management', icon: Users, href: '/employees', current: false });
//       baseItems.splice(5, 0, { name: 'Software Subscriptions', icon: Shield, href: '/software-subscriptions', current: false });
//     }

//     return baseItems;
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

//   // Format currency in BDT (Taka)
//   const formatCurrency = (amount) => {
//     if (amount === undefined || amount === null) return 'BDT 0';
    
//     // Format with BDT symbol and proper number formatting
//     const formattedAmount = new Intl.NumberFormat('en-BD', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     }).format(amount);
    
//     return `BDT ${formattedAmount}`;
//   };

//   // Format currency without symbol (for display where needed)
//   const formatAmount = (amount) => {
//     if (amount === undefined || amount === null) return '0.00';
    
//     return new Intl.NumberFormat('en-BD', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     }).format(amount);
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return null; // Will redirect
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Mobile sidebar backdrop */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <div className={`
//         fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
//         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0
//       `}>
//         {/* Sidebar header */}
//         <div className="p-6 border-b">
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
//               <DollarSign className="text-white" size={22} />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-gray-900">CostMaster</h1>
//               <p className="text-xs text-gray-500">Finance Dashboard</p>
//             </div>
//           </div>
//         </div>

//         {/* User profile */}
//         <div className="p-6 border-b">
//           <div className="flex items-center space-x-3">
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
//               {user.name?.charAt(0) || 'U'}
//             </div>
//             <div className="flex-1">
//               <h3 className="font-semibold text-gray-900">{user.name}</h3>
//               <div className="flex items-center justify-between">
//                 <p className="text-sm text-gray-500">{user.email}</p>
//                 <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize">
//                   {user.role}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Navigation */}
//         <nav className="p-4 space-y-1">
//           {getMenuItems().map((item) => {
//             const Icon = item.icon;
//             return (
//               <a
//                 key={item.name}
//                 href={item.href}
//                 className={`
//                   flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
//                   ${item.current 
//                     ? 'bg-blue-50 text-blue-700' 
//                     : 'text-gray-700 hover:bg-gray-100'
//                   }
//                 `}
//               >
//                 <Icon className="w-5 h-5 mr-3" />
//                 {item.name}
//               </a>
//             );
//           })}
//         </nav>

//         {/* Sidebar footer */}
//         <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
//           <button
//             onClick={handleLogout}
//             className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//           >
//             <LogOut className="w-5 h-5 mr-3" />
//             Logout
//           </button>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="lg:pl-64">
//         {/* Top header */}
//         <header className="bg-white shadow-sm">
//           <div className="px-4 sm:px-6 lg:px-8 py-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <button
//                   onClick={() => setSidebarOpen(!sidebarOpen)}
//                   className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
//                 >
//                   {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
//                 </button>
//                 <h2 className="text-lg font-semibold text-gray-900 ml-4 lg:ml-0">Dashboard Overview</h2>
//               </div>
              
//               <div className="flex items-center space-x-4">
//                 <button className="p-2 rounded-lg hover:bg-gray-100">
//                   <Bell size={20} />
//                 </button>
//                 <button className="p-2 rounded-lg hover:bg-gray-100">
//                   <Settings size={20} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Main dashboard content */}
//         <main className="p-4 md:p-6">
//           {/* Header with refresh button */}
//           <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Expense Dashboard</h1>
//               <p className="text-gray-600 mt-2">Track and analyze your office expenses in BDT (Taka)</p>
//             </div>
//             <button
//               onClick={handleRefresh}
//               className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               <RefreshCw className="w-4 h-4 mr-2" />
//               Refresh Data
//             </button>
//           </div>

//           {/* Error Display */}
//           {dashboardData.error && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//               <div className="flex items-center">
//                 <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
//                 <p className="text-red-700">{dashboardData.error}</p>
//               </div>
//             </div>
//           )}

//           {/* Monthly Summary Section */}
//           <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
//             <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
//               <h2 className="text-xl font-bold text-gray-900 mb-4 md:mb-0">Monthly Expense Summary</h2>
//               <div className="flex space-x-4">
//                 <div className="relative">
//                   <select
//                     value={dashboardData.selectedYear}
//                     onChange={(e) => handleMonthYearChange('selectedYear', e.target.value)}
//                     className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   >
//                     {yearOptions.map(year => (
//                       <option key={year} value={year}>{year}</option>
//                     ))}
//                   </select>
//                   <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
//                 </div>
//                 <div className="relative">
//                   <select
//                     value={dashboardData.selectedMonth}
//                     onChange={(e) => handleMonthYearChange('selectedMonth', e.target.value)}
//                     className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   >
//                     {MONTHS.map((month, index) => (
//                       <option key={index + 1} value={index + 1}>{month}</option>
//                     ))}
//                   </select>
//                   <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
//                 </div>
//               </div>
//             </div>

//             {dashboardData.isLoading ? (
//               <div className="flex justify-center items-center py-12">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//               </div>
//             ) : (
//               <>
//                 {/* Monthly Total Card */}
//                 <div className="bg-blue-50 rounded-xl p-6 mb-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-blue-600 text-sm font-medium">
//                         {MONTHS[dashboardData.selectedMonth - 1]} {dashboardData.selectedYear}
//                       </p>
//                       <h3 className="text-3xl font-bold text-gray-900 mt-2">
//                         {formatCurrency(dashboardData.monthlySummary.total)}
//                       </h3>
//                       <p className="text-gray-600 text-sm mt-2">Total Monthly Expenses (BDT)</p>
//                     </div>
//                     <div className="p-3 bg-blue-100 rounded-full">
//                       <DollarSign className="w-8 h-8 text-blue-600" />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Category Breakdown */}
//                 <div className="mb-6">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
//                   <div className="space-y-4">
//                     {dashboardData.monthlySummary.categoryBreakdown.map((item, index) => (
//                       <div key={index} className="space-y-2">
//                         <div className="flex justify-between">
//                           <span className="font-medium text-gray-700">{item.category}</span>
//                           <span className="font-semibold text-gray-900">
//                             {formatCurrency(item.amount)}
//                           </span>
//                         </div>
//                         <div className="w-full bg-gray-200 rounded-full h-2">
//                           <div 
//                             className="h-2 rounded-full" 
//                             style={{ 
//                               width: `${calculatePercentage(item.amount)}%`,
//                               backgroundColor: item.color 
//                             }}
//                           ></div>
//                         </div>
//                         <div className="flex justify-between text-sm text-gray-500">
//                           <span>{calculatePercentage(item.amount)}% of total</span>
//                           <span>BDT {formatAmount(item.amount)}</span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Detailed Monthly Breakdown */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                   {[
//                     { label: 'Employee Salaries', value: dashboardData.monthlySummary.employeeSalaries, color: 'blue' },
//                     { label: 'Office Rent', value: dashboardData.monthlySummary.officeRent, color: 'green' },
//                     { label: 'Utilities', value: dashboardData.monthlySummary.utilities, color: 'yellow' },
//                     { label: 'Office Supplies', value: dashboardData.monthlySummary.officeSupplies, color: 'purple' },
//                     { label: 'Software', value: dashboardData.monthlySummary.softwareSubscriptions, color: 'pink' },
//                     { label: 'Transport', value: dashboardData.monthlySummary.transportExpenses, color: 'cyan' },
//                     { label: 'Extra Expenses', value: dashboardData.monthlySummary.extraExpenses, color: 'red' },
//                   ].filter(item => item.value > 0).map((item, index) => (
//                     <div key={index} className="bg-gray-50 rounded-lg p-4">
//                       <p className="text-gray-500 text-sm">{item.label}</p>
//                       <p className="text-xl font-bold text-gray-900 mt-1">
//                         {formatCurrency(item.value)}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               </>
//             )}
//           </div>

//           {/* Yearly Summary Section */}
//           <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
//             <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
//               <h2 className="text-xl font-bold text-gray-900 mb-4 md:mb-0">Yearly Expense Summary</h2>
//               <div className="relative">
//                 <select
//                   value={dashboardData.selectedYearForYearly}
//                   onChange={(e) => handleMonthYearChange('selectedYearForYearly', e.target.value)}
//                   className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   {yearOptions.map(year => (
//                     <option key={year} value={year}>{year}</option>
//                   ))}
//                 </select>
//                 <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
//               </div>
//             </div>

//             {dashboardData.isLoadingYearly ? (
//               <div className="flex justify-center items-center py-12">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//               </div>
//             ) : (
//               <>
//                 {/* Yearly Total Card */}
//                 <div className="bg-green-50 rounded-xl p-6 mb-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-green-600 text-sm font-medium">Year {dashboardData.selectedYearForYearly}</p>
//                       <h3 className="text-3xl font-bold text-gray-900 mt-2">
//                         {formatCurrency(dashboardData.yearlySummary.total)}
//                       </h3>
//                       <p className="text-gray-600 text-sm mt-2">Total Yearly Expenses (BDT)</p>
//                     </div>
//                     <div className="p-3 bg-green-100 rounded-full">
//                       <Calendar className="w-8 h-8 text-green-600" />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Monthly Breakdown Chart */}
//                 <div className="mb-6">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown</h3>
//                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
//                     {dashboardData.yearlySummary.monthlyBreakdown.map((month, index) => (
//                       <div key={index} className="text-center">
//                         <div className="text-sm text-gray-500 mb-1">{month.monthName}</div>
//                         <div className="text-lg font-bold text-gray-900">
//                           {formatCurrency(month.total)}
//                         </div>
//                         <div className="mt-2">
//                           <div 
//                             className="h-2 bg-blue-200 rounded-full"
//                             style={{ 
//                               width: '100%',
//                               backgroundColor: month.total > 0 ? '#93C5FD' : '#E5E7EB'
//                             }}
//                           >
//                             <div 
//                               className="h-2 bg-blue-600 rounded-full"
//                               style={{ 
//                                 width: `${Math.min((month.total / Math.max(...dashboardData.yearlySummary.monthlyBreakdown.map(m => m.total || 1))) * 100, 100)}%`
//                               }}
//                             ></div>
//                           </div>
//                         </div>
//                         <div className="text-xs text-gray-500 mt-1">
//                           BDT {formatAmount(month.total)}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Yearly Category Totals */}
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Yearly Category Totals (BDT)</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                     {dashboardData.yearlySummary.categoryTotals.map((item, index) => (
//                       <div key={index} className="bg-gray-50 rounded-lg p-4">
//                         <div className="flex items-center mb-2">
//                           <div 
//                             className="w-3 h-3 rounded-full mr-2"
//                             style={{ backgroundColor: item.color }}
//                           ></div>
//                           <span className="font-medium text-gray-700">{item.category}</span>
//                         </div>
//                         <p className="text-xl font-bold text-gray-900">
//                           {formatCurrency(item.amount)}
//                         </p>
//                         <div className="text-sm text-gray-500 mt-1">
//                           BDT {formatAmount(item.amount)}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>

//           {/* Recent Expenses Section */}
//           <div className="bg-white rounded-xl shadow-lg p-6">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-xl font-bold text-gray-900">Recent Expenses (Past 30 Days)</h2>
//               <FileText className="w-6 h-6 text-gray-500" />
//             </div>
            
//             <div className="space-y-4">
//               {dashboardData.recentExpenses.map((expense) => (
//                 <div key={expense.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <h4 className="font-semibold text-gray-900">{expense.category}</h4>
//                       <p className="text-sm text-gray-500 mt-1">
//                         {expense.name} • {expense.payment}
//                       </p>
//                       <p className="text-sm text-gray-500">
//                         {expense.date.toLocaleDateString('en-BD', { 
//                           day: 'numeric',
//                           month: 'short',
//                           year: 'numeric'
//                         })}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <span className="text-xl font-bold text-gray-900 block">
//                         {formatCurrency(expense.amount)}
//                       </span>
//                       <span className="text-sm text-gray-500 block">
//                         BDT {formatAmount(expense.amount)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
              
//               {dashboardData.recentExpenses.length === 0 && (
//                 <div className="text-center py-8 text-gray-500">
//                   No recent expenses found in the past 30 days
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }



// app/dashboard/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Calendar,
  PieChart,
  FileText,
  BarChart3,
  Download,
  RefreshCw,
  ChevronDown,
  PlusCircle,
  Tag,
  AlertCircle,
  FileDown,
  Utensils  // Added for food cost icon
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// We'll use dynamic import for jsPDF to avoid SSR issues
let jsPDF;
let autoTable;

if (typeof window !== 'undefined') {
  import('jspdf').then((jsPDFModule) => {
    jsPDF = jsPDFModule.default;
  });
  import('jspdf-autotable').then((autoTableModule) => {
    autoTable = autoTableModule.default;
  });
}

// API base URL
const API_BASE_URL = 'http://localhost:5004/api';

// Months for dropdown
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState({ monthly: false, yearly: false });
  const [pdfReady, setPdfReady] = useState(false);
  
  // Initialize PDF libraries on client side
  useEffect(() => {
    const initializePDF = async () => {
      if (typeof window !== 'undefined') {
        const [jsPDFModule, autoTableModule] = await Promise.all([
          import('jspdf'),
          import('jspdf-autotable')
        ]);
        jsPDF = jsPDFModule.default;
        autoTable = autoTableModule.default;
        setPdfReady(true);
      }
    };
    
    initializePDF();
  }, []);
  
  const [dashboardData, setDashboardData] = useState({
    // Selected Period
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1,
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
      foodCosts: 0,  // Added food costs
      categoryBreakdown: []
    },
    
    yearlySummary: {
      total: 0,
      monthlyBreakdown: [],
      categoryTotals: []
    },
    
    recentExpenses: [],
    
    isLoading: false,
    isLoadingYearly: false,
    error: null
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
      fetchRecentExpenses();
    }
  }, [user, authLoading, dashboardData.selectedYear, dashboardData.selectedMonth, dashboardData.selectedYearForYearly]);

  // Check if user is authenticated
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

  // Format currency without symbol (for display where needed)
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
      setDashboardData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { selectedYear, selectedMonth } = dashboardData;
      const headers = getAuthHeaders();
      
      // Fetch all data including food costs
      const responses = await Promise.allSettled([
        fetch(`${API_BASE_URL}/employees`, { headers }),
        fetch(`${API_BASE_URL}/office-rents`, { headers }),
        fetch(`${API_BASE_URL}/bills/month/${selectedYear}/${selectedMonth}`, { headers }),
        fetch(`${API_BASE_URL}/office-supplies`, { headers }),
        fetch(`${API_BASE_URL}/software-subscriptions`, { headers }),
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

      const monthEmployees = filterByMonth(data[0]?.data, 'salaryDate');
      const monthRents = filterByMonth(data[1]?.data, 'date');
      const monthBills = data[2]?.data || [];
      const monthSupplies = filterByMonth(data[3]?.data, 'date');
      const monthSoftware = filterByMonth(data[4]?.data, 'date');
      const monthTransport = filterByMonth(data[5]?.data, 'date');
      const monthExtra = filterByMonth(data[6]?.data, 'date');
      const monthFoodCosts = filterByMonth(data[7]?.data, 'date');  // Added food costs

      // Calculate totals including food costs
      const employeeSalaries = monthEmployees.reduce((sum, emp) => sum + (emp.calculatedSalary || emp.salary || 0), 0);
      const officeRent = monthRents.reduce((sum, rent) => sum + (rent.rent || 0), 0);
      const utilities = monthBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
      const officeSupplies = monthSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0);
      const softwareSubscriptions = monthSoftware.reduce((sum, software) => sum + (software.amount || 0), 0);
      const transportExpenses = monthTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0);
      const extraExpenses = monthExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0);
      const foodCosts = monthFoodCosts.reduce((sum, food) => sum + (food.cost || 0), 0);  // Added food costs

      const total = employeeSalaries + officeRent + utilities + officeSupplies + 
                    softwareSubscriptions + transportExpenses + extraExpenses + foodCosts;

      // Create category breakdown for chart including food costs
      const categoryBreakdown = [
        { category: 'Employee Salaries', amount: employeeSalaries, color: '#3B82F6' },
        { category: 'House Rent', amount: officeRent, color: '#10B981' },
        { category: 'Utilities', amount: utilities, color: '#F59E0B' },
        { category: 'Office Supplies', amount: officeSupplies, color: '#8B5CF6' },
        { category: 'Software Subscriptions', amount: softwareSubscriptions, color: '#EC4899' },
        { category: 'Transport Expenses', amount: transportExpenses, color: '#06B6D4' },
        { category: 'Extra Expenses', amount: extraExpenses, color: '#EF4444' },
        { category: 'Food Costs', amount: foodCosts, color: '#22C55E' }  // Green color for food
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
          foodCosts,  // Added food costs
          categoryBreakdown
        },
        isLoading: false
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
        error: error.message || 'Failed to load monthly summary data',
        isLoading: false 
      }));
    }
  };

  // Fetch yearly summary data (UPDATED to include food costs)
  const fetchYearlySummary = async () => {
    if (!user) return;
    
    try {
      setDashboardData(prev => ({ ...prev, isLoadingYearly: true }));
      
      const { selectedYearForYearly } = dashboardData;
      const headers = getAuthHeaders();
      
      // Fetch all data including food costs
      const responses = await Promise.allSettled([
        fetch(`${API_BASE_URL}/employees`, { headers }),
        fetch(`${API_BASE_URL}/office-rents`, { headers }),
        fetch(`${API_BASE_URL}/bills`, { headers }),
        fetch(`${API_BASE_URL}/office-supplies`, { headers }),
        fetch(`${API_BASE_URL}/software-subscriptions`, { headers }),
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

      // Filter data for selected year
      const filterByYear = (items, dateField) => {
        if (!items || !Array.isArray(items)) return [];
        return items.filter(item => {
          if (!item[dateField]) return false;
          const date = new Date(item[dateField]);
          return date.getFullYear() === selectedYearForYearly;
        });
      };

      const yearEmployees = filterByYear(data[0]?.data, 'salaryDate');
      const yearRents = filterByYear(data[1]?.data, 'date');
      const yearBills = (data[2]?.data || []).filter(bill => bill.year === selectedYearForYearly);
      const yearSupplies = filterByYear(data[3]?.data, 'date');
      const yearSoftware = filterByYear(data[4]?.data, 'date');
      const yearTransport = filterByYear(data[5]?.data, 'date');
      const yearExtra = filterByYear(data[6]?.data, 'date');
      const yearFoodCosts = filterByYear(data[7]?.data, 'date');  // Added food costs

      // Calculate monthly breakdown including food costs
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

        const monthEmployees = filterByMonth(yearEmployees, 'salaryDate');
        const monthRents = filterByMonth(yearRents, 'date');
        const monthBills = yearBills.filter(bill => bill.month === month);
        const monthSupplies = filterByMonth(yearSupplies, 'date');
        const monthSoftware = filterByMonth(yearSoftware, 'date');
        const monthTransport = filterByMonth(yearTransport, 'date');
        const monthExtra = filterByMonth(yearExtra, 'date');
        const monthFoodCosts = filterByMonth(yearFoodCosts, 'date');  // Added food costs

        const total = 
          monthEmployees.reduce((sum, emp) => sum + (emp.calculatedSalary || emp.salary || 0), 0) +
          monthRents.reduce((sum, rent) => sum + (rent.rent || 0), 0) +
          monthBills.reduce((sum, bill) => sum + (bill.amount || 0), 0) +
          monthSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0) +
          monthSoftware.reduce((sum, software) => sum + (software.amount || 0), 0) +
          monthTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0) +
          monthExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0) +
          monthFoodCosts.reduce((sum, food) => sum + (food.cost || 0), 0);  // Added food costs

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
          extraExpenses: monthExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0),
          foodCosts: monthFoodCosts.reduce((sum, food) => sum + (food.cost || 0), 0)  // Added food costs
        };
      });

      // Calculate category totals for the year including food costs
      const categoryTotals = [
        { category: 'Employee Salaries', amount: yearEmployees.reduce((sum, emp) => sum + (emp.calculatedSalary || emp.salary || 0), 0), color: '#3B82F6' },
        { category: 'House Rent', amount: yearRents.reduce((sum, rent) => sum + (rent.rent || 0), 0), color: '#10B981' },
        { category: 'Utilities', amount: yearBills.reduce((sum, bill) => sum + (bill.amount || 0), 0), color: '#F59E0B' },
        { category: 'Office Supplies', amount: yearSupplies.reduce((sum, supply) => sum + (supply.price || 0), 0), color: '#8B5CF6' },
        { category: 'Software Subscriptions', amount: yearSoftware.reduce((sum, software) => sum + (software.amount || 0), 0), color: '#EC4899' },
        { category: 'Transport Expenses', amount: yearTransport.reduce((sum, transport) => sum + (transport.cost || 0), 0), color: '#06B6D4' },
        { category: 'Extra Expenses', amount: yearExtra.reduce((sum, extra) => sum + (extra.amount || 0), 0), color: '#EF4444' },
        { category: 'Food Costs', amount: yearFoodCosts.reduce((sum, food) => sum + (food.cost || 0), 0), color: '#22C55E' }  // Added food costs
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
      
      if (error.message === 'Authentication failed. Please login again.') {
        localStorage.clear();
        router.push('/');
        return;
      }
      
      setDashboardData(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to load yearly summary data',
        isLoadingYearly: false 
      }));
    }
  };

  // Fetch recent expenses (UPDATED to include food costs)
  const fetchRecentExpenses = async () => {
    if (!user) return;
    
    try {
      const headers = getAuthHeaders();
      
      // Combine recent expenses from all categories
      const recentExpenses = [];
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      
      // Helper function to add expenses
      const addExpenses = (data, type, nameField, amountField, dateField) => {
        if (data?.data && Array.isArray(data.data)) {
          data.data.forEach(item => {
            if (item[dateField]) {
              const date = new Date(item[dateField]);
              if (date >= oneMonthAgo) {
                recentExpenses.push({
                  id: item._id || item.id || Date.now() + Math.random(),
                  category: type,
                  name: item[nameField] || 'Unknown',
                  amount: item[amountField] || 0,
                  date: date,
                  payment: item.paymentMethod || 'Cash'
                });
              }
            }
          });
        }
      };

      // Fetch all expense types including food costs
      const responses = await Promise.allSettled([
        fetch(`${API_BASE_URL}/employees`, { headers }),
        fetch(`${API_BASE_URL}/office-rents`, { headers }),
        fetch(`${API_BASE_URL}/bills`, { headers }),
        fetch(`${API_BASE_URL}/office-supplies`, { headers }),
        fetch(`${API_BASE_URL}/software-subscriptions`, { headers }),
        fetch(`${API_BASE_URL}/transport-expenses`, { headers }),
        fetch(`${API_BASE_URL}/extra-expenses`, { headers }),
        fetch(`${API_BASE_URL}/food-costs`, { headers })  // Added food costs
      ]);

      const data = await Promise.all(
        responses.map(async (response) => {
          if (response.status === 'fulfilled') {
            try {
              return await response.value.json();
            } catch (error) {
              return { data: [] };
            }
          }
          return { data: [] };
        })
      );

      // Add all expenses including food costs
      addExpenses(data[0], 'Employee Salary', 'name', 'calculatedSalary', 'salaryDate');
      addExpenses(data[1], 'House Rent', 'type', 'rent', 'date');
      addExpenses(data[2], 'Utility Bill', 'name', 'amount', 'date');
      addExpenses(data[3], 'Office Supply', 'name', 'price', 'date');
      addExpenses(data[4], 'Software', 'softwareName', 'amount', 'date');
      addExpenses(data[5], 'Transport', 'transportName', 'cost', 'date');
      addExpenses(data[6], 'Extra Expense', 'expenseName', 'amount', 'date');
      addExpenses(data[7], 'Food Cost', 'note', 'cost', 'date');  // Added food costs (using note as name)

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

  // Download Monthly Summary PDF (UPDATED to include food costs)
  const downloadMonthlyPDF = async () => {
    if (!pdfReady || downloadingPDF.monthly || dashboardData.isLoading || !dashboardData.monthlySummary.categoryBreakdown.length) {
      alert('Please wait for PDF libraries to load or ensure there is data available.');
      return;
    }
    
    setDownloadingPDF(prev => ({ ...prev, monthly: true }));
    
    try {
      // Ensure jsPDF is loaded
      if (!jsPDF) {
        const jsPDFModule = await import('jspdf');
        jsPDF = jsPDFModule.default;
      }
      
      // Ensure autoTable is loaded
      if (!autoTable) {
        const autoTableModule = await import('jspdf-autotable');
        autoTable = autoTableModule.default;
      }
      
      const doc = new jsPDF();
      const monthName = MONTHS[dashboardData.selectedMonth - 1];
      const year = dashboardData.selectedYear;
      const summary = dashboardData.monthlySummary;
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text(`Monthly Expense Summary - ${monthName} ${year}`, 105, 20, { align: 'center' });
      
      // Add company/org info
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
      doc.text(`Generated by: ${user?.name || 'Admin'}`, 105, 38, { align: 'center' });
      
      // Add total summary
      doc.setFontSize(16);
      doc.setTextColor(30, 64, 175);
      doc.text(`Total Monthly Expenses: ${formatCurrency(summary.total)}`, 105, 50, { align: 'center' });
      
      // Add summary table using autoTable (UPDATED to include food costs)
      autoTable(doc, {
        startY: 60,
        head: [['Category', 'Amount (BDT)', 'Percentage']],
        body: [
          ['Employee Salaries', formatAmount(summary.employeeSalaries), `${calculatePercentage(summary.employeeSalaries)}%`],
          ['House Rent', formatAmount(summary.officeRent), `${calculatePercentage(summary.officeRent)}%`],
          ['Utilities', formatAmount(summary.utilities), `${calculatePercentage(summary.utilities)}%`],
          ['Office Supplies', formatAmount(summary.officeSupplies), `${calculatePercentage(summary.officeSupplies)}%`],
          ['Software Subscriptions', formatAmount(summary.softwareSubscriptions), `${calculatePercentage(summary.softwareSubscriptions)}%`],
          ['Transport Expenses', formatAmount(summary.transportExpenses), `${calculatePercentage(summary.transportExpenses)}%`],
          ['Extra Expenses', formatAmount(summary.extraExpenses), `${calculatePercentage(summary.extraExpenses)}%`],
          ['Food Costs', formatAmount(summary.foodCosts), `${calculatePercentage(summary.foodCosts)}%`],  // Added food costs
          ['', '', ''],
          ['TOTAL', formatAmount(summary.total), '100%']
        ],
        theme: 'grid',
        headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 12 },
        bodyStyles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 60 },
          2: { cellWidth: 40 }
        },
        margin: { left: 15, right: 15 }
      });
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
        doc.text('Confidential - Office Expenses Report', 15, 285);
      }
      
      // Save the PDF
      doc.save(`Monthly_Expense_Summary_${monthName}_${year}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPDF(prev => ({ ...prev, monthly: false }));
    }
  };

  // Download Yearly Summary PDF (UPDATED to include food costs)
  const downloadYearlyPDF = async () => {
    if (!pdfReady || downloadingPDF.yearly || dashboardData.isLoadingYearly || !dashboardData.yearlySummary.monthlyBreakdown.length) {
      alert('Please wait for PDF libraries to load or ensure there is data available.');
      return;
    }
    
    setDownloadingPDF(prev => ({ ...prev, yearly: true }));
    
    try {
      // Ensure jsPDF is loaded
      if (!jsPDF) {
        const jsPDFModule = await import('jspdf');
        jsPDF = jsPDFModule.default;
      }
      
      // Ensure autoTable is loaded
      if (!autoTable) {
        const autoTableModule = await import('jspdf-autotable');
        autoTable = autoTableModule.default;
      }
      
      const doc = new jsPDF();
      const year = dashboardData.selectedYearForYearly;
      const summary = dashboardData.yearlySummary;
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text(`Yearly Expense Summary - ${year}`, 105, 20, { align: 'center' });
      
      // Add company/org info
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
      doc.text(`Generated by: ${user?.name || 'Admin'}`, 105, 38, { align: 'center' });
      
      // Add total summary
      doc.setFontSize(16);
      doc.setTextColor(34, 197, 94);
      doc.text(`Total Yearly Expenses: ${formatCurrency(summary.total)}`, 105, 50, { align: 'center' });
      
      // Add monthly breakdown table (UPDATED to include food costs)
      autoTable(doc, {
        startY: 60,
        head: [['Month', 'Total (BDT)', 'Employee Salaries', 'House Rent', 'Utilities', 'Other']],
        body: summary.monthlyBreakdown.map(month => [
          month.monthName,
          formatAmount(month.total),
          formatAmount(month.employeeSalaries),
          formatAmount(month.officeRent),
          formatAmount(month.utilities),
          formatAmount(month.officeSupplies + month.softwareSubscriptions + month.transportExpenses + month.extraExpenses + month.foodCosts)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94], textColor: 255, fontSize: 11 },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 }
        },
        margin: { left: 10, right: 10 }
      });
      
      // Add a new page for category totals
      doc.addPage();
      
      // Add category totals (UPDATED to include food costs)
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Yearly Category Totals', 105, 20, { align: 'center' });
      
      autoTable(doc, {
        startY: 30,
        head: [['Category', 'Amount (BDT)', 'Percentage', 'Monthly Average']],
        body: summary.categoryTotals.map(item => [
          item.category,
          formatAmount(item.amount),
          `${calculateYearlyPercentage(item.amount)}%`,
          formatAmount(item.amount / 12)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 11 },
        bodyStyles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 40 },
          2: { cellWidth: 35 },
          3: { cellWidth: 45 }
        },
        margin: { left: 10, right: 10 }
      });
      
      // Add summary statistics
      const finalY = doc.lastAutoTable.finalY || 80;
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      
      // Find highest and lowest months
      if (summary.monthlyBreakdown.length > 0) {
        const highestMonth = summary.monthlyBreakdown.reduce((max, month) => 
          month.total > max.total ? month : max, summary.monthlyBreakdown[0]);
        const lowestMonth = summary.monthlyBreakdown.reduce((min, month) => 
          month.total < min.total ? month : min, summary.monthlyBreakdown[0]);
        
        doc.text(`Highest Expense Month: ${highestMonth.monthName} - ${formatCurrency(highestMonth.total)}`, 15, finalY + 15);
        doc.text(`Lowest Expense Month: ${lowestMonth.monthName} - ${formatCurrency(lowestMonth.total)}`, 15, finalY + 25);
        
        // Calculate average monthly expense
        const avgMonthly = summary.total / 12;
        doc.text(`Average Monthly Expense: ${formatCurrency(avgMonthly)}`, 15, finalY + 35);
        
        // Calculate average food costs per month
        const totalFoodCosts = summary.categoryTotals.find(item => item.category === 'Food Costs')?.amount || 0;
        doc.text(`Average Monthly Food Costs: ${formatCurrency(totalFoodCosts / 12)}`, 15, finalY + 45);
      }
      
      // Add footer to all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
        doc.text('Confidential - Yearly Expenses Report', 15, 285);
      }
      
      // Save the PDF
      doc.save(`Yearly_Expense_Summary_${year}.pdf`);
      
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
    fetchRecentExpenses();
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
          <h1 className="text-3xl font-bold text-gray-900">Expense Dashboard</h1>
          <p className="text-gray-600 mt-2">Track and analyze your office expenses in BDT (Taka)</p>
        </div>
        
        {/* User Info */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={dashboardData.isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${dashboardData.isLoading ? 'animate-spin' : ''}`} />
            {dashboardData.isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
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
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 md:mb-0">
            <h2 className="text-xl font-bold text-gray-900">Monthly Expense Summary</h2>
            <button
              onClick={downloadMonthlyPDF}
              disabled={!pdfReady || downloadingPDF.monthly || dashboardData.isLoading || dashboardData.monthlySummary.categoryBreakdown.length === 0}
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
                disabled={dashboardData.isLoading}
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
                disabled={dashboardData.isLoading}
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
        ) : dashboardData.monthlySummary.categoryBreakdown.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500">
              No expense data found for {MONTHS[dashboardData.selectedMonth - 1]} {dashboardData.selectedYear}
            </p>
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
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                  <button
                    onClick={downloadMonthlyPDF}
                    disabled={!pdfReady || downloadingPDF.monthly || dashboardData.monthlySummary.categoryBreakdown.length === 0}
                    className="p-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download PDF Report"
                  >
                    <FileDown className="w-5 h-5 text-blue-600" />
                  </button>
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
                { label: 'Employee Salaries', value: dashboardData.monthlySummary.employeeSalaries, color: 'blue', icon: '👨‍💼' },
                { label: 'House Rent', value: dashboardData.monthlySummary.officeRent, color: 'green', icon: '🏢' },
                { label: 'Utilities', value: dashboardData.monthlySummary.utilities, color: 'yellow', icon: '💡' },
                { label: 'Office Supplies', value: dashboardData.monthlySummary.officeSupplies, color: 'purple', icon: '📦' },
                { label: 'Software Subscriptions', value: dashboardData.monthlySummary.softwareSubscriptions, color: 'pink', icon: '💻' },
                { label: 'Transport Expenses', value: dashboardData.monthlySummary.transportExpenses, color: 'cyan', icon: '🚗' },
                { label: 'Extra Expenses', value: dashboardData.monthlySummary.extraExpenses, color: 'red', icon: '📝' },
                { label: 'Food Costs', value: dashboardData.monthlySummary.foodCosts, color: 'green', icon: '🍽️' },  // Added food costs
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">{item.icon}</span>
                    <p className="text-gray-500 text-sm">{item.label}</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(item.value)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {item.value > 0 ? `${calculatePercentage(item.value)}% of total` : 'No data'}
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
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 md:mb-0">
            <h2 className="text-xl font-bold text-gray-900">Yearly Expense Summary</h2>
            <button
              onClick={downloadYearlyPDF}
              disabled={!pdfReady || downloadingPDF.yearly || dashboardData.isLoadingYearly || dashboardData.yearlySummary.monthlyBreakdown.length === 0}
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
              disabled={dashboardData.isLoadingYearly}
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
        ) : dashboardData.yearlySummary.monthlyBreakdown.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500">
              No expense data found for year {dashboardData.selectedYearForYearly}
            </p>
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
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                  <button
                    onClick={downloadYearlyPDF}
                    disabled={!pdfReady || downloadingPDF.yearly || dashboardData.yearlySummary.monthlyBreakdown.length === 0}
                    className="p-2 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download PDF Report"
                  >
                    <FileDown className="w-5 h-5 text-green-600" />
                  </button>
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
                      BDT {formatAmount(item.amount)} ({calculateYearlyPercentage(item.amount)}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Expenses Section (Includes Food Costs) */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Expenses (Past 30 Days)</h2>
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-gray-500 mr-2" />
            <Utensils className="w-5 h-5 text-green-500" />
          </div>
        </div>
        
        <div className="space-y-4">
          {dashboardData.recentExpenses.length > 0 ? (
            dashboardData.recentExpenses.map((expense) => (
              <div key={expense.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-semibold text-gray-900">{expense.category}</h4>
                      {expense.category === 'Food Cost' && (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          🍽️ Food
                        </span>
                      )}
                    </div>
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
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent expenses found in the past 30 days
            </div>
          )}
        </div>
      </div>

 

    </div>
  );
}