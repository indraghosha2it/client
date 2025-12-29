"use client";

import React, { useState } from "react";

export default function ExpensePage() {
  const [bills, setBills] = useState([
    { name: "Electricity Bill", amount: "", date: "", isFixed: true },
    { name: "Water Bill", amount: "", date: "", isFixed: true },
    { name: "Internet Bill", amount: "", date: "", isFixed: true },
    { name: "Gas Bill", amount: "", date: "", isFixed: true },
  ]);

  const handleAmountChange = (index, value) => {
    const updatedBills = [...bills];
    updatedBills[index].amount = value;
    setBills(updatedBills);
  };

  const handleDateChange = (index, value) => {
    const updatedBills = [...bills];
    updatedBills[index].date = value;
    setBills(updatedBills);
  };

  const addBillField = () => {
    setBills([...bills, { 
      name: "Other Bill", 
      amount: "", 
      date: "", 
      isFixed: false 
    }]);
  };

  const removeBillField = (index) => {
    // Don't remove fixed bills
    if (bills[index].isFixed) return;
    
    const updatedBills = [...bills];
    updatedBills.splice(index, 1);
    setBills(updatedBills);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(bills);
    alert("Utility bills saved!");
  };

  // Get today's date in YYYY-MM-DD format for the date input
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Utilities Expense
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {bills.map((bill, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-center">
              {/* Bill Name - Fixed bills are uneditable */}
              <div className="col-span-4">
                {bill.isFixed ? (
                  <div className="px-3 py-2 border rounded-md bg-gray-50 text-gray-700">
                    {bill.name}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={bill.name}
                    onChange={(e) => {
                      const updatedBills = [...bills];
                      updatedBills[index].name = e.target.value;
                      setBills(updatedBills);
                    }}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              {/* Bill Amount */}
              <div className="col-span-3">
                <input
                  type="number"
                  placeholder="Amount"
                  value={bill.amount}
                  onChange={(e) => handleAmountChange(index, e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Date Field */}
              <div className="col-span-3">
                <input
                  type="date"
                  value={bill.date}
                  onChange={(e) => handleDateChange(index, e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  max={getTodayDate()}
                />
              </div>

              {/* Remove Button - Only for non-fixed bills */}
              <div className="col-span-2">
                {!bill.isFixed && (
                  <button
                    type="button"
                    onClick={() => removeBillField(index)}
                    className="w-full px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add Bill Button */}
          <button
            type="button"
            onClick={addBillField}
            className="w-full border border-dashed border-blue-500 text-blue-600 py-2 rounded-md hover:bg-blue-50 transition"
          >
            + Add Bill
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Save Expenses
          </button>
        </form>
      </div>
    </div>
  );
}