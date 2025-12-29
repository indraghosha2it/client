'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  Receipt,
  Download,
  TrendingUp
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'expenses', label: 'Expenses', icon: <DollarSign size={20} /> },
  { id: 'reports', label: 'Reports', icon: <FileText size={20} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
  { id: 'users', label: 'User Management', icon: <Users size={20} />, adminOnly: true },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} />, adminOnly: true },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  return (
    <>
      {/* Mobile overlay */}
      {isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        bg-white border-r border-gray-200
        transform ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        transition-transform duration-300
        w-64 lg:w-64
        flex flex-col
        ${isCollapsed ? 'lg:w-20' : ''}
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="font-bold text-lg">CostMaster</h1>
                  <p className="text-xs text-gray-500">Office Finance</p>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
                <DollarSign className="text-white" size={20} />
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg
                transition-colors
                ${activeMenu === item.id 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <div className={`${activeMenu === item.id ? 'text-blue-600' : 'text-gray-400'}`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-3">
              <h3 className="font-semibold text-sm text-blue-800 mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <button className="flex items-center space-x-2 text-sm text-blue-700 hover:text-blue-800 w-full">
                  <Receipt size={16} />
                  <span>Add Expense</span>
                </button>
                <button className="flex items-center space-x-2 text-sm text-blue-700 hover:text-blue-800 w-full">
                  <Download size={16} />
                  <span>Export Report</span>
                </button>
                <button className="flex items-center space-x-2 text-sm text-blue-700 hover:text-blue-800 w-full">
                  <TrendingUp size={16} />
                  <span>View Analytics</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-4 left-4 lg:hidden z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg"
      >
        <Menu size={20} />
      </button>
    </>
  );
}