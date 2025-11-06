import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, Calendar, TrendingUp, Plus, Trash2, Moon, Sun } from 'lucide-react';

const BiWeeklyBudget = () => {
  // Load from localStorage or use defaults
  const [availableBalance, setAvailableBalance] = useState(() => {
    const saved = localStorage.getItem('availableBalance');
    return saved !== null ? Number(saved) : 0;
  });
  
  const [nextPayDate, setNextPayDate] = useState(() => {
    const saved = localStorage.getItem('nextPayDate');
    return saved || '2025-11-15';
  });
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  
  const [bills, setBills] = useState(() => {
    const saved = localStorage.getItem('bills');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
    { id: 1, dueDate: '2025-11-01', name: '🏠 Rent', category: 'Housing', amount: 900, status: 'Pending' },
    { id: 2, dueDate: '2025-11-01', name: '📱 T-Mobile', category: 'Utilities', amount: 115, status: 'Pending' },
    { id: 3, dueDate: '2025-11-01', name: '💳 Apple Card', category: 'Credit Card', amount: 150, status: 'Pending' },
    { id: 4, dueDate: '2025-11-01', name: '💳 AFCU Loan', category: 'Loan', amount: 490, status: 'Pending' },
    { id: 5, dueDate: '2025-11-01', name: '🌐 Xfinity', category: 'Utilities', amount: 95, status: 'Pending' },
    { id: 6, dueDate: '2025-11-03', name: '🌐 G-Fiber', category: 'Utilities', amount: 71.40, status: 'Pending' },
    { id: 7, dueDate: '2025-11-09', name: '🎬 Crunchyroll', category: 'Entertainment', amount: 12, status: 'Pending' },
    { id: 8, dueDate: '2025-11-13', name: '🚗 Insurance', category: 'Insurance', amount: 253.05, status: 'Pending' },
    { id: 9, dueDate: '2025-11-15', name: '💰 MACU Personal Loan', category: 'Loan', amount: 150, status: 'Pending' },
    { id: 10, dueDate: '2025-11-16', name: '💳 Citi Card', category: 'Credit Card', amount: 70, status: 'Pending' },
    { id: 11, dueDate: '2025-11-21', name: '⚡ Electric', category: 'Utilities', amount: 222, status: 'Pending' },
    { id: 12, dueDate: '2025-11-23', name: '💳 USB Credit Card', category: 'Credit Card', amount: 243, status: 'Pending' },
    { id: 13, dueDate: '2025-11-27', name: '🎵 Spotify', category: 'Entertainment', amount: 21.48, status: 'Pending' },
    { id: 14, dueDate: '2025-11-30', name: '💳 MACU Credit Card', category: 'Credit Card', amount: 150, status: 'Pending' },
    ];
  });
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('activeTab');
    return saved || 'dashboard';
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('availableBalance', availableBalance.toString());
  }, [availableBalance]);

  useEffect(() => {
    localStorage.setItem('nextPayDate', nextPayDate);
  }, [nextPayDate]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const today = new Date().toISOString().split('T')[0];

  const calculateBillMetrics = useMemo(() => {
    return bills.map(bill => {
      const daysUntilDue = Math.max(0, Math.ceil((new Date(bill.dueDate) - new Date(today)) / (1000 * 60 * 60 * 24)));
      return {
        ...bill,
        daysUntilDue
      };
    });
  }, [bills, today]);

  const totalWeight = useMemo(() => {
    return calculateBillMetrics.reduce((sum, bill) => {
      if (bill.status === 'Pending') {
        return sum + (1 / (bill.daysUntilDue + 1));
      }
      return sum;
    }, 0);
  }, [calculateBillMetrics]);

  const billsWithAllocation = useMemo(() => {
    return calculateBillMetrics.map(bill => {
      if (bill.status === 'Pending' && totalWeight > 0) {
        const weight = 1 / (bill.daysUntilDue + 1);
        const allocationPercent = (weight / totalWeight) * 100;
        const allocatedAmount = (availableBalance * allocationPercent) / 100;
        return {
          ...bill,
          allocationPercent,
          allocatedAmount
        };
      }
      return {
        ...bill,
        allocationPercent: 0,
        allocatedAmount: 0
      };
    });
  }, [calculateBillMetrics, totalWeight, availableBalance]);

  const dashboardStats = useMemo(() => {
    const totalBills = bills.reduce((sum, b) => sum + (b.status === 'Pending' ? b.amount : 0), 0);
    const totalAllocated = billsWithAllocation.reduce((sum, b) => sum + (b.status === 'Pending' ? b.allocatedAmount : 0), 0);
    const remaining = availableBalance - totalAllocated;
    return { totalBills, totalAllocated, remaining };
  }, [bills, billsWithAllocation, availableBalance]);

  const addBill = () => {
    if (bills.length >= 20) {
      alert('Maximum 20 bills reached');
      return;
    }
    const newBill = {
      id: Date.now(),
      dueDate: today,
      name: 'New Bill',
      category: 'Other',
      amount: 0,
      status: 'Pending'
    };
    setBills([...bills, newBill]);
  };

  const deleteBill = (id) => {
    setBills(bills.filter(b => b.id !== id));
  };

  const updateBill = (id, field, value) => {
    setBills(bills.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const sortedBills = [...billsWithAllocation].sort((a, b) => 
    new Date(a.dueDate) - new Date(b.dueDate)
  );

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              💰 Bi-Weekly Budget Tracker
            </h1>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Proportional bill allocation based on due dates
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-lg transition ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                : 'bg-white hover:bg-gray-100 text-gray-700'
            }`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </header>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'dashboard' 
                ? darkMode 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-indigo-600 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'bills' 
                ? darkMode 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-indigo-600 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Bills List
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'calendar' 
                ? darkMode 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-indigo-600 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Calendar
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Available Balance
                </label>
                <div className="flex items-center gap-2">
                  <DollarSign className="text-green-600" size={24} />
                  <input
                    type="number"
                    value={availableBalance}
                    onChange={(e) => setAvailableBalance(Number(e.target.value))}
                    className={`text-3xl font-bold border-b-2 focus:border-indigo-600 outline-none w-full transition ${
                      darkMode 
                        ? 'bg-gray-800 text-white border-gray-600' 
                        : 'bg-white text-gray-800 border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Next Pay Date
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="text-blue-600" size={24} />
                  <input
                    type="date"
                    value={nextPayDate}
                    onChange={(e) => setNextPayDate(e.target.value)}
                    className={`text-xl font-semibold border-b-2 focus:border-indigo-600 outline-none w-full transition ${
                      darkMode 
                        ? 'bg-gray-800 text-white border-gray-600' 
                        : 'bg-white text-gray-800 border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-red-600" size={20} />
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Bills Due
                  </h3>
                </div>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  ${dashboardStats.totalBills.toFixed(2)}
                </p>
              </div>

              <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="text-yellow-600" size={20} />
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Allocated Now
                  </h3>
                </div>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  ${dashboardStats.totalAllocated.toFixed(2)}
                </p>
              </div>

              <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="text-green-600" size={20} />
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Remaining
                  </h3>
                </div>
                <p className={`text-3xl font-bold ${dashboardStats.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${dashboardStats.remaining.toFixed(2)}
                </p>
              </div>
            </div>

            <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Upcoming Bills
              </h3>
              <div className="space-y-2">
                {sortedBills.filter(b => b.status === 'Pending').slice(0, 5).map(bill => (
                  <div key={bill.id} className={`flex justify-between items-center p-3 rounded-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {bill.name}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Due: {bill.dueDate} ({bill.daysUntilDue} days)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        ${bill.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-indigo-600">Reserve: ${bill.allocatedAmount.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bills' && (
          <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Bills Management
              </h2>
              <button
                onClick={addBill}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  darkMode 
                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
                disabled={bills.length >= 20}
              >
                <Plus size={20} />
                Add Bill ({bills.length}/20)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left p-3 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Due Date
                    </th>
                    <th className={`text-left p-3 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Bill Name
                    </th>
                    <th className={`text-left p-3 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Category
                    </th>
                    <th className={`text-right p-3 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Amount
                    </th>
                    <th className={`text-left p-3 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </th>
                    <th className={`text-right p-3 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Days Until
                    </th>
                    <th className={`text-right p-3 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Allocation %
                    </th>
                    <th className={`text-right p-3 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Allocated $
                    </th>
                    <th className={`text-center p-3 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBills.map(bill => (
                    <tr key={bill.id} className={`border-b ${
                      darkMode 
                        ? 'border-gray-700 hover:bg-gray-700' 
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}>
                      <td className="p-3">
                        <input
                          type="date"
                          value={bill.dueDate}
                          onChange={(e) => updateBill(bill.id, 'dueDate', e.target.value)}
                          className={`border rounded px-2 py-1 text-sm ${
                            darkMode 
                              ? 'bg-gray-700 text-white border-gray-600' 
                              : 'bg-white text-gray-800 border-gray-300'
                          }`}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={bill.name}
                          onChange={(e) => updateBill(bill.id, 'name', e.target.value)}
                          className={`border rounded px-2 py-1 w-full text-sm ${
                            darkMode 
                              ? 'bg-gray-700 text-white border-gray-600' 
                              : 'bg-white text-gray-800 border-gray-300'
                          }`}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={bill.category}
                          onChange={(e) => updateBill(bill.id, 'category', e.target.value)}
                          className={`border rounded px-2 py-1 w-full text-sm ${
                            darkMode 
                              ? 'bg-gray-700 text-white border-gray-600' 
                              : 'bg-white text-gray-800 border-gray-300'
                          }`}
                        />
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          value={bill.amount}
                          onChange={(e) => updateBill(bill.id, 'amount', Number(e.target.value))}
                          className={`border rounded px-2 py-1 w-24 text-sm text-right ${
                            darkMode 
                              ? 'bg-gray-700 text-white border-gray-600' 
                              : 'bg-white text-gray-800 border-gray-300'
                          }`}
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={bill.status}
                          onChange={(e) => updateBill(bill.id, 'status', e.target.value)}
                          className={`border rounded px-2 py-1 text-sm ${
                            darkMode 
                              ? 'bg-gray-700 text-white border-gray-600' 
                              : 'bg-white text-gray-800 border-gray-300'
                          }`}
                        >
                          <option>Pending</option>
                          <option>Paid</option>
                        </select>
                      </td>
                      <td className={`p-3 text-right text-sm ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                        {bill.daysUntilDue}
                      </td>
                      <td className="p-3 text-right text-sm text-indigo-600">
                        {bill.allocationPercent.toFixed(1)}%
                      </td>
                      <td className="p-3 text-right text-sm font-semibold text-green-600">
                        ${bill.allocatedAmount.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => deleteBill(bill.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Calendar View
            </h2>
            <div className="space-y-3">
              {sortedBills.map(bill => (
                <div key={bill.id} className={`flex items-center gap-4 p-4 rounded-lg border-l-4 border-indigo-500 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="bg-indigo-100 px-3 py-2 rounded-lg text-center min-w-[80px]">
                    <p className="text-xs text-indigo-600 font-medium">
                      {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {new Date(bill.dueDate).getDate()}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {bill.name}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {bill.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      ${bill.amount.toFixed(2)}
                    </p>
                    <p className={`text-sm ${bill.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                      {bill.status}
                    </p>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Reserve Now
                    </p>
                    <p className="font-semibold text-indigo-600">${bill.allocatedAmount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiWeeklyBudget;