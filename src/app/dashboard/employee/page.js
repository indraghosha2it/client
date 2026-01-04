"use client";

import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function EmployeePage() {
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    salary: "",
    workingDays: 26,
    absentDays: 0,
    paymentMethod: "Bank Transfer",
    notes: "",
    salaryDate: new Date().toISOString().split('T')[0]
  });

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Filter states
  const [filterYear, setFilterYear] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterName, setFilterName] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // Available years and months for filtering
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Backend API URL
  const API_URL = "http://localhost:5001/api";

  // Fetch employees when page loads
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Extract years from employees when employees change
  useEffect(() => {
    if (employees.length > 0) {
      // Extract unique years from salary dates
      const years = [...new Set(
        employees.map(emp => {
          const date = new Date(emp.salaryDate);
          return date.getFullYear();
        })
      )].sort((a, b) => b - a); // Sort descending (newest first)
      
      setAvailableYears(years);
      
      // Extract months based on selected year
      updateAvailableMonths(filterYear, employees);
    }
  }, [employees, filterYear]);

  // Filter employees when filter criteria change
  useEffect(() => {
    applyFilters();
  }, [employees, filterYear, filterMonth, filterName, filterDesignation]);

  // Function to update available months based on selected year
  const updateAvailableMonths = (year, empList) => {
    if (year === "all") {
      setAvailableMonths([]);
      return;
    }
    
    const months = [...new Set(
      empList
        .filter(emp => {
          const date = new Date(emp.salaryDate);
          return date.getFullYear().toString() === year;
        })
        .map(emp => {
          const date = new Date(emp.salaryDate);
          return date.getMonth() + 1; // Months are 1-indexed for display
        })
    )].sort((a, b) => a - b);
    
    setAvailableMonths(months);
  };

  // Apply filters to employees
  const applyFilters = () => {
    let filtered = [...employees];

    // Filter by year
    if (filterYear !== "all") {
      filtered = filtered.filter(emp => {
        const salaryYear = new Date(emp.salaryDate).getFullYear().toString();
        return salaryYear === filterYear;
      });
    }

    // Filter by month
    if (filterMonth !== "all") {
      filtered = filtered.filter(emp => {
        const salaryMonth = (new Date(emp.salaryDate).getMonth() + 1).toString();
        return salaryMonth === filterMonth;
      });
    }

    // Filter by name (case insensitive)
    if (filterName.trim() !== "") {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    // Filter by designation (case insensitive)
    if (filterDesignation.trim() !== "") {
      filtered = filtered.filter(emp =>
        emp.designation.toLowerCase().includes(filterDesignation.toLowerCase())
      );
    }

    // Sort by salary date (newest first)
    filtered.sort((a, b) => new Date(b.salaryDate) - new Date(a.salaryDate));

    setFilteredEmployees(filtered);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterYear("all");
    setFilterMonth("all");
    setFilterName("");
    setFilterDesignation("");
  };

  // Function to fetch all employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/employees`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.data);
        setFilteredEmployees(data.data);
        if (!isEditMode) {
          setMessage({ 
            type: 'success', 
            text: `Loaded ${data.count} employees` 
          });
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to load employees' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Cannot connect to backend: ${error.message}. Make sure backend is running on port 5001!` 
      });
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch single employee for editing
  const fetchEmployeeForEdit = async (id) => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const response = await fetch(`${API_URL}/employees/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const employee = data.data;
        setFormData({
          name: employee.name,
          designation: employee.designation,
          salary: employee.salary.toString(),
          workingDays: employee.workingDays || 26,
          absentDays: employee.absentDays || 0,
          paymentMethod: employee.paymentMethod || "Bank Transfer",
          notes: employee.notes || "",
          salaryDate: employee.salaryDate ? new Date(employee.salaryDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
        setEditingId(id);
        setIsEditMode(true);
        setMessage({ 
          type: 'info', 
          text: `Editing: ${employee.name}` 
        });
        
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message || 'Failed to load employee data' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Failed to load employee: ${error.message}` 
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
      console.log("Sending data to backend:", formData);
      
      // Use the NORMAL endpoint (not employees-temp-fix)
      const url = isEditMode 
        ? `${API_URL}/employees/${editingId}`
        : `${API_URL}/employees`; // ← NORMAL ENDPOINT
      
      const method = isEditMode ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);
      
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        // Success!
        const actionText = isEditMode ? "updated" : "added";
        setMessage({ 
          type: 'success', 
          text: `✅ Employee ${actionText} successfully!` 
        });
        
        // Reset form and edit mode
        setFormData({
          name: "",
          designation: "",
          salary: "",
          workingDays: 26,
          absentDays: 0,
          paymentMethod: "Bank Transfer",
          notes: "",
          salaryDate: new Date().toISOString().split('T')[0]
        });
        
        setEditingId(null);
        setIsEditMode(false);
        
        // Refresh employee list
        fetchEmployees();
        
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
        text: `❌ Failed to save employee: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setFormData({
      name: "",
      designation: "",
      salary: "",
      workingDays: 26,
      absentDays: 0,
      paymentMethod: "Bank Transfer",
      notes: "",
      salaryDate: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
    setIsEditMode(false);
    setMessage({ type: '', text: '' });
  };

  // Delete employee function
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/employees/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ ${data.message}` 
        });
        // If we're editing this employee, cancel edit mode
        if (editingId === id) {
          cancelEdit();
        }
        // Refresh list
        fetchEmployees();
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ ${data.message || data.error}` 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `❌ Failed to delete employee: ${error.message}` 
      });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate per day salary and deductions
  const calculateSalaryDetails = (employee) => {
    const perDaySalary = employee.salary / employee.workingDays;
    const deduction = perDaySalary * employee.absentDays;
    const finalSalary = Math.max(0, employee.salary - deduction);
    
    return {
      perDaySalary: perDaySalary.toFixed(2),
      deduction: deduction.toFixed(2),
      finalSalary: finalSalary.toFixed(2)
    };
  };

  // Handle year filter change
  const handleYearChange = (e) => {
    setFilterYear(e.target.value);
    setFilterMonth("all"); // Reset month when year changes
  };

  // Handle month filter change
  const handleMonthChange = (e) => {
    setFilterMonth(e.target.value);
  };

  // Calculate statistics for filtered employees
  const calculateFilteredStats = () => {
    const totalSalary = filteredEmployees.reduce((sum, emp) => sum + emp.salary, 0);
    const totalAbsentDays = filteredEmployees.reduce((sum, emp) => sum + emp.absentDays, 0);
    const totalWorkingDays = filteredEmployees.reduce((sum, emp) => sum + emp.workingDays, 0);
    
    // Calculate total final salary (after deductions)
    const totalFinalSalary = filteredEmployees.reduce((sum, emp) => {
      const perDaySalary = emp.salary / emp.workingDays;
      const deduction = perDaySalary * emp.absentDays;
      const finalSalary = Math.max(0, emp.salary - deduction);
      return sum + finalSalary;
    }, 0);
    
    // Calculate total deductions
    const totalDeductions = filteredEmployees.reduce((sum, emp) => {
      const perDaySalary = emp.salary / emp.workingDays;
      const deduction = perDaySalary * emp.absentDays;
      return sum + deduction;
    }, 0);
    
    return {
      totalEmployees: filteredEmployees.length,
      totalSalary: totalSalary.toFixed(2),
      totalFinalSalary: totalFinalSalary.toFixed(2),
      totalDeductions: totalDeductions.toFixed(2),
      totalAbsentDays,
      totalWorkingDays,
      totalPresentDays: totalWorkingDays - totalAbsentDays
    };
  };

  const stats = calculateFilteredStats();

  // Format currency in BDT
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

   // Generate PDF report
  const generatePDF = () => {
    if (filteredEmployees.length === 0) {
      setMessage({ type: 'error', text: 'No employees data to download' });
      return;
    }

    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Title
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.setFont("helvetica", "bold");
      doc.text("Employee Salary Report", pageWidth / 2, 20, { align: "center" });
      
      // Company/Report Info
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 30);
      
      // Filter information
      let filterInfo = "All Employees";
      if (filterYear !== "all" || filterMonth !== "all") {
        filterInfo = `Filter: ${filterYear !== "all" ? `Year: ${filterYear}` : ""} ${filterMonth !== "all" ? `Month: ${monthNames[parseInt(filterMonth) - 1]}` : ""}`;
      }
      if (filterName.trim() !== "") {
        filterInfo += ` | Name: ${filterName}`;
      }
      if (filterDesignation.trim() !== "") {
        filterInfo += ` | Designation: ${filterDesignation}`;
      }
      doc.text(`Report Type: ${filterInfo}`, 14, 36);
      doc.text(`Total Records: ${filteredEmployees.length}`, 14, 42);
      
      // Prepare table data - Designation under Name in same column
      const tableData = filteredEmployees.map(employee => {
        const salaryDetails = calculateSalaryDetails(employee);
        // Combine name and designation in one cell
        const nameWithDesignation = `${employee.name}\n${employee.designation}`;
        
        return [
          nameWithDesignation,
          formatDate(employee.salaryDate),
          `BDT ${formatCurrency(employee.salary)}`,
          employee.workingDays,
          employee.absentDays,
          `BDT ${salaryDetails.deduction}`,
          `BDT ${salaryDetails.finalSalary}`,
          employee.paymentMethod,
          employee.notes || "-"
        ];
      });
      
      // Add table using autoTable
      autoTable(doc, {
        startY: 50,
        head: [['Employee Details', 'Salary Date', 'Base Salary', 'Work Days', 'Absent', 'Deduction', 'Final Salary', 'Payment', 'Notes']],
        body: tableData,
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { 
            cellWidth: 35,
            cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
            valign: 'middle'
          },
          1: { cellWidth: 20 },
          2: { cellWidth: 25 },
          3: { cellWidth: 15 },
          4: { cellWidth: 15 },
          5: { cellWidth: 20 },
          6: { cellWidth: 25 },
          7: { cellWidth: 20 },
          8: { cellWidth: 25 }
        },
        // Custom cell renderer to handle multi-line text
        didParseCell: function(data) {
          // For the first column (name with designation), allow text wrapping
          if (data.column.index === 0) {
            data.cell.styles.cellPadding = { top: 3, right: 2, bottom: 3, left: 2 };
          }
        },
        didDrawPage: function (data) {
          // Footer
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(10);
          doc.setTextColor(150);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
          );
        }
      });
      
      // Calculate totals
      const lastY = doc.lastAutoTable.finalY + 10;
      
      // Add summary section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40);
      doc.text("SUMMARY", 14, lastY);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Employees: ${stats.totalEmployees}`, 14, lastY + 8);
      doc.text(`Total Base Salary: BDT ${stats.totalSalary}`, 14, lastY + 16);
      doc.text(`Total Deductions: BDT ${stats.totalDeductions}`, 14, lastY + 24);
      doc.text(`Total Payable: BDT ${stats.totalFinalSalary}`, 14, lastY + 32);
      doc.text(`Total Working Days: ${stats.totalWorkingDays}`, 14, lastY + 40);
      doc.text(`Total Absent Days: ${stats.totalAbsentDays}`, 14, lastY + 48);
      
      // Add generated date at bottom
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(
        `Report generated on ${new Date().toLocaleString()}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 20,
        { align: "center" }
      );
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const filename = `employee_salary_report_${timestamp}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      // Show success message
      setMessage({ type: 'success', text: `PDF downloaded successfully: ${filename}` });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setMessage({ type: 'error', text: 'Failed to generate PDF. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Employee Management System
        </h1>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex justify-between ${message.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' : message.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' : 'bg-blue-100 border border-blue-300 text-blue-800'}`}>
            <div className="flex items-center">
              <span className="mr-2">
                {message.type === 'success' ? '✅' : 
                 message.type === 'error' ? '❌' : 
                 '📝'}
              </span>
              <span>{message.text}</span>
            </div>
              
            <div className="flex space-x-2">
              {isEditMode && (
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
                >
                  Cancel Edit
                </button>
              )}
              <button
                onClick={fetchEmployees}
                disabled={loading}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* Left: Employee Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              {isEditMode && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                  Editing Mode
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Employee Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Name *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter employee name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>

              {/* Designation & Salary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation *
                  </label>
                  <input
                    type="text"
                    name="designation"
                    placeholder="Enter designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Salary (BDT) *
                  </label>
                  <input
                    type="number"
                    name="salary"
                    placeholder="Enter monthly salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Working Days & Absent Days */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Working Days *
                  </label>
                  <input
                    type="number"
                    name="workingDays"
                    placeholder="Enter total working days"
                    value={formData.workingDays}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="20"
                    max="31"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Usually 26 days in a month
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Absent Days
                  </label>
                  <input
                    type="number"
                    name="absentDays"
                    placeholder="Enter absent days"
                    value={formData.absentDays}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max={formData.workingDays}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Days employee was absent
                  </p>
                </div>
              </div>

              {/* Salary Calculation Preview */}
              {formData.salary && formData.workingDays && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Salary Calculation Preview</h3>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-white p-2 rounded">
                      <div className="text-gray-600">Per Day Salary</div>
                      <div className="font-semibold">
                        BDT {((parseFloat(formData.salary) || 0) / (parseInt(formData.workingDays) || 26)).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="text-gray-600">Deduction</div>
                      <div className="font-semibold text-red-600">
                        -BDT {(((parseFloat(formData.salary) || 0) / (parseInt(formData.workingDays) || 26)) * (parseInt(formData.absentDays) || 0)).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="text-gray-600">Final Salary</div>
                      <div className="font-semibold text-green-600">
                        BDT {Math.max(0, (parseFloat(formData.salary) || 0) - 
                          (((parseFloat(formData.salary) || 0) / (parseInt(formData.workingDays) || 26)) * (parseInt(formData.absentDays) || 0))).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Salary Date & Payment Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Date *
                  </label>
                  <input
                    type="date"
                    name="salaryDate"
                    value={formData.salaryDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    required
                    disabled={loading}
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Mobile Banking">Mobile Banking</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  placeholder="Add any additional notes about the employee..."
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${isEditMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEditMode ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    isEditMode ? 'Update Employee' : 'Save Employee to Database'
                  )}
                </button>
                
                {isEditMode && (
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

          {/* Right: Employee List with Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Employees List ({filteredEmployees.length} / {employees.length})
                </h2>
              </div>
              
              {/* PDF Download Button - Moved to top */}
              {filteredEmployees.length > 0 && (
                <div className="mt-4 md:mt-0">
                  <button
                    onClick={generatePDF}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center transition duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Download PDF 
                  </button>
                </div>
              )}
            </div>

            {/* Filter Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3">Filter Employees</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    value={filterYear}
                    onChange={handleYearChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Years</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Month Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month
                  </label>
                  <select
                    value={filterMonth}
                    onChange={handleMonthChange}
                    disabled={filterYear === "all"}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      filterYear === "all" ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="all">All Months</option>
                    {availableMonths.map(month => (
                      <option key={month} value={month}>
                        {monthNames[month - 1]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search by Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name..."
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Designation Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search by Designation
                  </label>
                  <input
                    type="text"
                    placeholder="Enter designation..."
                    value={filterDesignation}
                    onChange={(e) => setFilterDesignation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Active Filters & Reset Button */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex flex-wrap gap-2">
                  {filterYear !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Year: {filterYear}
                      <button 
                        onClick={() => setFilterYear("all")}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  {filterMonth !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Month: {monthNames[parseInt(filterMonth) - 1]}
                      <button 
                        onClick={() => setFilterMonth("all")}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  {filterName.trim() !== "" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Name: {filterName}
                      <button 
                        onClick={() => setFilterName("")}
                        className="ml-2 text-yellow-600 hover:text-yellow-800"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  {filterDesignation.trim() !== "" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Designation: {filterDesignation}
                      <button 
                        onClick={() => setFilterDesignation("")}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                </div>

                {(filterYear !== "all" || filterMonth !== "all" || filterName.trim() !== "" || filterDesignation.trim() !== "") && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md transition-colors"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Filter Stats */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-white p-2 rounded border">
                  <div className="text-gray-600">Employees</div>
                  <div className="font-semibold">{stats.totalEmployees}</div>
                </div>
                <div className="bg-white p-2 rounded border">
                  <div className="text-gray-600">Total Base Salary</div>
                  <div className="font-semibold">BDT {stats.totalSalary}</div>
                </div>
                <div className="bg-white p-2 rounded border">
                  <div className="text-gray-600">Total Deductions</div>
                  <div className="font-semibold text-red-600">BDT {stats.totalDeductions}</div>
                </div>
                <div className="bg-white p-2 rounded border">
                  <div className="text-gray-600">Total Payable</div>
                  <div className="font-semibold text-green-600">BDT {stats.totalFinalSalary}</div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading employees from database...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {employees.length === 0 ? 'No employees yet' : 'No employees match your filters'}
                </h3>
                <p className="text-gray-500">
                  {employees.length === 0 
                    ? 'Add your first employee using the form above!' 
                    : 'Try changing your filter criteria or clear filters to see all employees.'}
                </p>
                {employees.length > 0 && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee Details
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Working Days
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Salary Details
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEmployees.map((employee) => {
                        const salaryDetails = calculateSalaryDetails(employee);
                        
                        return (
                          <tr key={employee._id} className={`hover:bg-gray-50 ${editingId === employee._id ? 'bg-blue-50' : ''}`}>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">
                                {employee.name}
                              </div>
                              <div className="text-sm text-gray-600">{employee.designation}</div>
                              {employee.notes && (
                                <div className="text-xs text-gray-500 mt-1">
                                  <span className="font-medium">Note:</span> {employee.notes}
                                </div>
                              )}
                              <div className="text-xs text-gray-500">
                                Salary Date: {formatDate(employee.salaryDate)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Working Days:</span>
                                  <span className="font-medium">{employee.workingDays}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Absent Days:</span>
                                  <span className="font-medium text-red-600">{employee.absentDays}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Present Days:</span>
                                  <span className="font-medium text-green-600">
                                    {employee.workingDays - employee.absentDays}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Base Salary:</span>
                                  <span className="font-medium">BDT {employee.salary.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Per Day:</span>
                                  <span className="text-sm">BDT {salaryDetails.perDaySalary}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Deduction:</span>
                                  <span className="text-sm text-red-600">-BDT {salaryDetails.deduction}</span>
                                </div>
                                <div className="flex justify-between border-t pt-1">
                                  <span className="text-sm font-medium text-gray-700">Final Salary:</span>
                                  <span className="font-semibold text-green-600">
                                    BDT {parseFloat(salaryDetails.finalSalary).toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Paid via: {employee.paymentMethod}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => fetchEmployeeForEdit(employee._id)}
                                  className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(employee._id)}
                                  className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Salary Summary Section */}
                {filteredEmployees.length > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                          Salary Summary for {filterYear !== "all" ? filterYear : "All Years"}
                          {filterMonth !== "all" ? ` - ${monthNames[parseInt(filterMonth) - 1]}` : ""}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-gray-600">Total Employees</div>
                            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Total Base Salary</div>
                            <div className="text-2xl font-bold">BDT {stats.totalSalary}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Total Deductions</div>
                            <div className="text-2xl font-bold text-red-600">BDT {stats.totalDeductions}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Total Payable</div>
                            <div className="text-3xl font-bold text-green-600">BDT {stats.totalFinalSalary}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-green-200">
                      <div>
                        <div className="text-sm text-gray-600">Total Working Days</div>
                        <div className="font-semibold">{stats.totalWorkingDays}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Total Present Days</div>
                        <div className="font-semibold text-green-600">{stats.totalPresentDays}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Total Absent Days</div>
                        <div className="font-semibold text-red-600">{stats.totalAbsentDays}</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}