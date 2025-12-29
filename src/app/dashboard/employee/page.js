// "use client";

// import React, { useState } from "react";

// export default function EmployeePage() {
//   const [formData, setFormData] = useState({
//     name: "",
//     designation: "",
//     salary: "",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log(formData);
//     alert("Employee data submitted!");
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-2xl font-semibold text-center mb-6">
//           Employee Form
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Row 1 - Employee Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Employee Name
//             </label>
//             <input
//               type="text"
//               name="name"
//               placeholder="Enter employee name"
//               value={formData.name}
//               onChange={handleChange}
//               className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>

//           {/* Row 2 - Designation & Salary */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Designation */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Designation
//               </label>
//               <input
//                 type="text"
//                 name="designation"
//                 placeholder="Enter designation"
//                 value={formData.designation}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>

//             {/* Salary */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Salary
//               </label>
//               <input
//                 type="number"
//                 name="salary"
//                 placeholder="Enter salary"
//                 value={formData.salary}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
//           >
//             Submit
//           </button>
//         </form>
//       </div>
      
//     </div>
    
//   );
// }
"use client";

import React, { useState, useEffect } from "react";

export default function EmployeePage() {
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    salary: "",
    email: "",
    phone: "",
  });

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null); // Track which employee is being edited
  const [isEditMode, setIsEditMode] = useState(false); // Track if we're in edit mode

  // Backend API URL
  const API_URL = "http://localhost:5001/api";

  // Fetch employees when page loads
  useEffect(() => {
    fetchEmployees();
  }, []);

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
        if (!isEditMode) {
          setMessage({ 
            type: 'success', 
            text: `Loaded ${data.count} employees ` 
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
        text: `Cannot connect to backend: ${error.message}. Make sure backend is running on port 5000!` 
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
          email: employee.email || "",
          phone: employee.phone || "",
          department: employee.department || "General"
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
      
      const url = isEditMode 
        ? `${API_URL}/employees/${editingId}`
        : `${API_URL}/employees`;
      
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
          email: "",
          phone: "",
          department: "General"
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
      email: "",
      phone: "",
      department: "General"
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
                    Salary  *
                  </label>
                  <input
                    type="number"
                    name="salary"
                    placeholder="Enter salary"
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

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="employee@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+880"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
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

          {/* Right: Employee List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Employees List ({employees.length})
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading employees from database...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No employees yet</h3>
                <p className="text-gray-500">Add your first employee using the form on the left!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Designation
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Salary
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr key={employee._id} className={`hover:bg-gray-50 ${editingId === employee._id ? 'bg-blue-50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {employee.name}
                            {employee.email && (
                              <div className="text-xs text-gray-500">{employee.email}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-900">{employee.designation}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            ৳{employee.salary.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(employee.dateJoined).toLocaleDateString()}
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}