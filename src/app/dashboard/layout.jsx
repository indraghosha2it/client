'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  DollarSign, 
  FileText, 
  Building2,
  Cloud,
  PieChart, 
  Briefcase,
  Settings,
  Bell,
  User,
  Menu,
  X,
  LogOut
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'Employee', icon: User, href: '/dashboard/employee' },
    { name: 'Office Rent', icon: Building2, href: '/dashboard/officeRent' },
    { name: 'Utility Bills', icon: DollarSign, href: '/dashboard/expenses' },
    { name: 'Office Supplies', icon: Briefcase, href: '/dashboard/supplies' },
    { name: 'Software subscriptions', icon: Cloud, href: '/dashboard/subscriptions' },
    { name: 'Reports', icon: FileText, href: '/dashboard/reports' },
    { name: 'Analytics', icon: PieChart, href: '/dashboard/analytics' },
    { name: 'Categories', icon: DollarSign, href: '/dashboard/categories' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  // Function to check if a nav item is active
  const isActive = (href) => {
    // For dashboard home page
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    // For other pages - check if current path starts with the href
    return pathname.startsWith(href) && href !== '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-md"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-blue-900 to-purple-900 text-white 
        transform transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-blue-800 flex-shrink-0">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-8 h-8" />
            OfficeCostTracker
          </h1>
          <p className="text-blue-200 text-sm mt-1">Manage expenses efficiently</p>
        </div>

        {/* Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        active
                          ? 'bg-blue-800 text-white shadow-md'
                          : 'hover:bg-blue-800/50 text-blue-100'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon size={20} />
                      <span className="font-medium">{item.name}</span>
                      {active && (
                        <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-blue-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">Admin User</p>
              <p className="text-blue-200 text-sm truncate">admin@office.com</p>
            </div>
            <button 
              onClick={() => {
                // Add logout logic here
                console.log('Logout clicked');
              }}
              className="p-2 hover:bg-blue-800 rounded-lg flex-shrink-0"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Welcome back, Admin</h2>
              <p className="text-gray-600 text-sm">Here's your expense overview</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-full">
                <Bell size={22} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <div className="hidden md:block">
                  <p className="font-medium">Admin User</p>
                  <p className="text-gray-500 text-sm">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}