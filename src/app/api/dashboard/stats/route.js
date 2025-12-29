import { NextResponse } from 'next/server';

// Mock database - Replace with actual database calls
const mockExpenses = [
  { id: 1, category: 'salary', amount: 85000, date: '2024-01-31', payment_method: 'bank_transfer' },
  { id: 2, category: 'rent', amount: 30000, date: '2024-01-30', payment_method: 'online' },
  { id: 3, category: 'electricity', amount: 5000, date: '2024-01-28', payment_method: 'credit_card' },
  { id: 4, category: 'internet', amount: 2500, date: '2024-01-28', payment_method: 'credit_card' },
  { id: 5, category: 'supplies', amount: 1500, date: '2024-01-25', payment_method: 'cash' },
  { id: 6, category: 'software', amount: 12500, date: '2024-01-20', payment_method: 'online' },
  { id: 7, category: 'transport', amount: 5000, date: '2024-01-15', payment_method: 'cash' },
  { id: 8, category: 'miscellaneous', amount: 6750, date: '2024-01-10', payment_method: 'bank_transfer' },
];

export async function GET() {
  try {
    // Calculate current month total (January 2024)
    const currentMonthTotal = mockExpenses
      .filter(exp => exp.date.startsWith('2024-01'))
      .reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate previous month total (December 2023 - mock)
    const previousMonthTotal = 142800;

    // Calculate YTD total
    const ytdTotal = 1851000;

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    mockExpenses.forEach(exp => {
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([category, amount]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount,
      percentage: Math.round((amount / currentMonthTotal) * 100),
      color: getCategoryColor(category)
    }));

    // Recent expenses (last 4)
    const recentExpenses = mockExpenses.slice(0, 4).map(exp => ({
      ...exp,
      category: exp.category.charAt(0).toUpperCase() + exp.category.slice(1),
      payment: formatPaymentMethod(exp.payment_method)
    }));

    return NextResponse.json({
      success: true,
      data: {
        currentMonthTotal,
        previousMonthTotal,
        ytdTotal,
        categoryBreakdown,
        recentExpenses
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    salary: '#3B82F6',
    rent: '#10B981',
    electricity: '#F59E0B',
    internet: '#8B5CF6',
    gas: '#EF4444',
    supplies: '#06B6D4',
    software: '#8B5CF6',
    transport: '#F97316',
    miscellaneous: '#6B7280'
  };
  return colors[category] || '#6B7280';
}

function formatPaymentMethod(method: string): string {
  const methods: Record<string, string> = {
    cash: 'Cash',
    bank_transfer: 'Bank Transfer',
    online: 'Online',
    credit_card: 'Credit Card',
    cheque: 'Cheque'
  };
  return methods[method] || method;
}