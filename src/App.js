import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, Calendar, TrendingUp, Plus, Trash2, Moon, Sun, AlertCircle, CheckCircle, Clock, CreditCard, Percent, TrendingDown } from 'lucide-react';

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

  const [creditCards, setCreditCards] = useState(() => {
    const saved = localStorage.getItem('creditCards');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      { id: 1, name: '💳 Apple Card', balance: 6477.71, creditLimit: 10000, apr: 25.99, minPayment: 150, dueDate: '2025-12-01' },
      { id: 2, name: '💳 Citi Card', balance: 2881.36, creditLimit: 5000, apr: 27.99, minPayment: 70, dueDate: '2025-11-16' },
      { id: 3, name: '💳 USB Credit Card', balance: 3841.51, creditLimit: 8000, apr: 27.99, minPayment: 243, dueDate: '2025-11-23' },
      { id: 4, name: '💳 MACU Credit Card', balance: 5935.08, creditLimit: 10000, apr: 12.99, minPayment: 150, dueDate: '2025-11-30' },
      { id: 5, name: '💳 Amazon Credit Card', balance: 0, creditLimit: 3000, apr: 27.99, minPayment: 0, dueDate: '2025-11-14' },
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
    localStorage.setItem('creditCards', JSON.stringify(creditCards));
  }, [creditCards]);

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
    const paidCount = bills.filter(b => b.status === 'Paid').length;
    const pendingCount = bills.filter(b => b.status === 'Pending').length;
    const overdueBills = bills.filter(b => b.status === 'Pending' && new Date(b.dueDate) < new Date(today));
    const dueSoonBills = bills.filter(b => b.status === 'Pending' && b.daysUntilDue <= 3 && b.daysUntilDue > 0);
    
    return { 
      totalBills, 
      totalAllocated, 
      remaining, 
      paidCount, 
      pendingCount,
      overdueBills,
      dueSoonBills
    };
  }, [bills, billsWithAllocation, availableBalance, today]);

  const creditCardStats = useMemo(() => {
    const totalDebt = creditCards.reduce((sum, card) => sum + card.balance, 0);
    const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.creditLimit, 0);
    const totalMinPayments = creditCards.reduce((sum, card) => sum + card.minPayment, 0);
    const utilizationRate = totalCreditLimit > 0 ? (totalDebt / totalCreditLimit) * 100 : 0;
    const weightedAPR = creditCards.reduce((sum, card) => sum + (card.apr * card.balance), 0) / totalDebt || 0;
    
    return {
      totalDebt,
      totalCreditLimit,
      totalMinPayments,
      utilizationRate,
      weightedAPR,
      availableCredit: totalCreditLimit - totalDebt
    };
  }, [creditCards]);

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

  const addCreditCard = () => {
    if (creditCards.length >= 10) {
      alert('Maximum 10 credit cards reached');
      return;
    }
    const newCard = {
      id: Date.now(),
      name: 'New Credit Card',
      balance: 0,
      creditLimit: 1000,
      apr: 18.00,
      minPayment: 0,
      dueDate: today
    };
    setCreditCards([...creditCards, newCard]);
  };

  const deleteBill = (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      setBills(bills.filter(b => b.id !== id));
    }
  };

  const deleteCreditCard = (id) => {
    if (window.confirm('Are you sure you want to delete this credit card?')) {
      setCreditCards(creditCards.filter(c => c.id !== id));
    }
  };

  const updateBill = (id, field, value) => {
    setBills(bills.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const updateCreditCard = (id, field, value) => {
    setCreditCards(creditCards.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const sortedBills = [...billsWithAllocation].sort((a, b) => 
    new Date(a.dueDate) - new Date(b.dueDate)
  );

  const sortedCreditCards = [...creditCards].sort((a, b) => 
    new Date(a.dueDate) - new Date(b.dueDate)
  );

  const categoryTotals = useMemo(() => {
    const totals = {};
    bills.forEach(bill => {
      if (bill.status === 'Pending') {
        totals[bill.category] = (totals[bill.category] || 0) + bill.amount;
      }
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [bills]);

  return (
    <div className={`min-h-screen p-4 md:p-6 transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
              darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400' : 'text-slate-800'
            }`}>
              💰 Bi-Weekly Budget Tracker
            </h1>
            <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
              Smart bill allocation & credit card tracking
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-xl transition-all shadow-lg ${
              darkMode 
                ? 'bg-slate-700 hover:bg-slate-600 text-amber-400' 
                : 'bg-white hover:bg-slate-50 text-slate-700 shadow-emerald-200'
            }`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </header>

        {/* Alert Section */}
        {(dashboardStats.overdueBills.length > 0 || dashboardStats.dueSoonBills.length > 0 || creditCardStats.utilizationRate > 80) && (
          <div className="mb-6 space-y-2">
            {dashboardStats.overdueBills.length > 0 && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400">
                    {dashboardStats.overdueBills.length} Overdue Bill{dashboardStats.overdueBills.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {dashboardStats.overdueBills.map(b => b.name).join(', ')}
                  </p>
                </div>
              </div>
            )}
            {dashboardStats.dueSoonBills.length > 0 && (
              <div className={`${darkMode ? 'bg-amber-500 bg-opacity-10 border-amber-500' : 'bg-amber-100 border-amber-400'} border rounded-xl p-4 flex items-start gap-3`}>
                <Clock className={darkMode ? 'text-amber-400' : 'text-amber-600'} size={20} />
                <div>
                  <p className={`font-semibold ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                    {dashboardStats.dueSoonBills.length} Bill{dashboardStats.dueSoonBills.length > 1 ? 's' : ''} Due Soon (≤3 days)
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>
                    {dashboardStats.dueSoonBills.map(b => `${b.name} (${b.daysUntilDue}d)`).join(', ')}
                  </p>
                </div>
              </div>
            )}
            {creditCardStats.utilizationRate > 80 && (
              <div className={`${darkMode ? 'bg-orange-500 bg-opacity-10 border-orange-500' : 'bg-orange-100 border-orange-400'} border rounded-xl p-4 flex items-start gap-3`}>
                <TrendingUp className={darkMode ? 'text-orange-400' : 'text-orange-600'} size={20} />
                <div>
                  <p className={`font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                    High Credit Utilization ({creditCardStats.utilizationRate.toFixed(1)}%)
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>
                    Consider paying down your credit cards to improve your credit score
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 md:px-6 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'dashboard' 
                ? darkMode 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50' 
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-300'
                : darkMode
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-white text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
                darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-emerald-100'
              }`}>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Available Balance
                </label>
                <div className="flex items-center gap-2">
                  <DollarSign className={darkMode ? 'text-emerald-400' : 'text-emerald-600'} size={24} />
                  <input
                    type="number"
                    value={availableBalance}
                    onChange={(e) => setAvailableBalance(Number(e.target.value))}
                    className={`text-3xl font-bold border-b-2 focus:border-emerald-500 outline-none w-full transition ${
                      darkMode 
                        ? 'bg-slate-800 text-white border-slate-600' 
                        : 'bg-white text-slate-800 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
                darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-teal-100'
              }`}>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Next Pay Date
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className={darkMode ? 'text-cyan-400' : 'text-teal-600'} size={24} />
                  <input
                    type="date"
                    value={nextPayDate}
                    onChange={(e) => setNextPayDate(e.target.value)}
                    className={`text-xl font-semibold border-b-2 focus:border-teal-500 outline-none w-full transition ${
                      darkMode 
                        ? 'bg-slate-800 text-white border-slate-600' 
                        : 'bg-white text-slate-800 border-slate-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
                darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-rose-100'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-rose-500" size={20} />
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Total Bills Due
                  </h3>
                </div>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  ${dashboardStats.totalBills.toFixed(2)}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  {dashboardStats.pendingCount} pending
                </p>
              </div>

              <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
                darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-amber-100'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="text-amber-500" size={20} />
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Allocated Now
                  </h3>
                </div>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  ${dashboardStats.totalAllocated.toFixed(2)}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  {((dashboardStats.totalAllocated / dashboardStats.totalBills) * 100 || 0).toFixed(1)}% of total
                </p>
              </div>

              <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
                darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-emerald-100'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="text-emerald-500" size={20} />
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Remaining
                  </h3>
                </div>
                <p className={`text-3xl font-bold ${dashboardStats.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ${dashboardStats.remaining.toFixed(2)}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  After allocation
                </p>
              </div>

              <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
                darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-red-100'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="text-red-500" size={20} />
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    CC Debt
                  </h3>
                </div>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  ${creditCardStats.totalDebt.toFixed(2)}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  Min payment: ${creditCardStats.totalMinPayments}/mo
                </p>
              </div>
            </div>

            {/* Credit Card Summary */}
            <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
              darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'
            }`}>
              <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                💳 Credit Card Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Utilization Rate</p>
                  <p className={`text-2xl font-bold ${
                    creditCardStats.utilizationRate > 80 ? 'text-red-600' :
                    creditCardStats.utilizationRate > 50 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {creditCardStats.utilizationRate.toFixed(1)}%
                  </p>
                  <div className={`w-full h-2 rounded-full mt-2 overflow-hidden ${darkMode ? 'bg-slate-600' : 'bg-slate-200'}`}>
                    <div 
                      className={`h-full transition-all ${
                        creditCardStats.utilizationRate > 80 ? 'bg-red-500' :
                        creditCardStats.utilizationRate > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(creditCardStats.utilizationRate, 100)}%` }}
                    />
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Weighted APR</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    {creditCardStats.weightedAPR.toFixed(2)}%
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Available Credit</p>
                  <p className={`text-2xl font-bold text-emerald-600`}>
                    ${creditCardStats.availableCredit.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Upcoming Bills */}
            <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
              darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'
            }`}>
              <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                📅 Upcoming Bills (Next 7)
              </h3>
              <div className="space-y-3">
                {sortedBills.filter(b => b.status === 'Pending').slice(0, 7).map(bill => (
                  <div key={bill.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg transition-all hover:scale-[1.02] ${
                    darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                  } ${bill.daysUntilDue === 0 ? 'border-l-4 border-rose-500' : bill.daysUntilDue <= 3 ? 'border-l-4 border-amber-500' : ''}`}>
                    <div className="mb-2 sm:mb-0">
                      <p className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {bill.name}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Due: {new Date(bill.dueDate).toLocaleDateString()} 
                        <span className={`ml-2 font-medium ${
                          bill.daysUntilDue === 0 ? 'text-rose-500' : 
                          bill.daysUntilDue <= 3 ? 'text-amber-500' : 
                          darkMode ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          ({bill.daysUntilDue === 0 ? 'Today!' : `${bill.daysUntilDue} days`})
                        </span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        ${bill.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-emerald-600 font-medium">
                        Reserve: ${bill.allocatedAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )} shadow-lg shadow-emerald-300'
                : darkMode
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-white text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`px-4 md:px-6 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'bills' 
                ? darkMode 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50' 
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-300'
                : darkMode
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-white text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
          >
            Bills List
          </button>
          <button
            onClick={() => setActiveTab('creditcards')}
            className={`px-4 md:px-6 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'creditcards' 
                ? darkMode 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50' 
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-300'
                : darkMode
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-white text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
          >
            Credit Cards
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 md:px-6 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'calendar' 
                ? darkMode 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50' 
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-300'
                : darkMode
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-white text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 md:px-6 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'analytics' 
                ? darkMode 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50' 
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white