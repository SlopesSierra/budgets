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
              💰 Bi-Weekly Budgets
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
          {['dashboard', 'bills', 'creditcards', 'calendar', 'analytics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-6 py-2 rounded-xl font-medium transition-all capitalize ${
                activeTab === tab
                  ? darkMode 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50' 
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-300'
                  : darkMode
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-white text-slate-700 hover:bg-slate-100 shadow-sm'
              }`}
            >
              {tab === 'creditcards' ? 'Credit Cards' : tab}
            </button>
          ))}
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
        )}

        {/* Bills List Tab */}
        {activeTab === 'bills' && (
          <div className={`rounded-xl shadow-lg p-4 md:p-6 backdrop-blur-sm ${
            darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                📋 Bills Management
              </h2>
              <button
                onClick={addBill}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  darkMode 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/50' 
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-300'
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
                  <tr className={`border-b-2 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <th className={`text-left p-3 font-semibold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Due Date
                    </th>
                    <th className={`text-left p-3 font-semibold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Bill Name
                    </th>
                    <th className={`text-left p-3 font-semibold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Category
                    </th>
                    <th className={`text-right p-3 font-semibold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Amount
                    </th>
                    <th className={`text-left p-3 font-semibold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Status
                    </th>
                    <th className={`text-right p-3 font-semibold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Days
                    </th>
                    <th className={`text-right p-3 font-semibold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Alloc %
                    </th>
                    <th className={`text-right p-3 font-semibold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Allocated $
                    </th>
                    <th className={`text-center p-3 font-semibold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBills.map(bill => (
                    <tr key={bill.id} className={`border-b transition-colors ${
                      darkMode 
                        ? 'border-slate-700 hover:bg-slate-700/50' 
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}>
                      <td className="p-3">
                        <input
                          type="date"
                          value={bill.dueDate}
                          onChange={(e) => updateBill(bill.id, 'dueDate', e.target.value)}
                          className={`border rounded-lg px-2 py-1 text-sm ${
                            darkMode 
                              ? 'bg-slate-700 text-white border-slate-600' 
                              : 'bg-white text-slate-800 border-slate-300'
                          }`}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={bill.name}
                          onChange={(e) => updateBill(bill.id, 'name', e.target.value)}
                          className={`border rounded-lg px-2 py-1 w-full text-sm ${
                            darkMode 
                              ? 'bg-slate-700 text-white border-slate-600' 
                              : 'bg-white text-slate-800 border-slate-300'
                          }`}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={bill.category}
                          onChange={(e) => updateBill(bill.id, 'category', e.target.value)}
                          className={`border rounded-lg px-2 py-1 w-full text-sm ${
                            darkMode 
                              ? 'bg-slate-700 text-white border-slate-600' 
                              : 'bg-white text-slate-800 border-slate-300'
                          }`}
                        />
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={bill.amount}
                          onChange={(e) => updateBill(bill.id, 'amount', Number(e.target.value))}
                          className={`border rounded-lg px-2 py-1 w-24 text-sm text-right ${
                            darkMode 
                              ? 'bg-slate-700 text-white border-slate-600' 
                              : 'bg-white text-slate-800 border-slate-300'
                          }`}
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={bill.status}
                          onChange={(e) => updateBill(bill.id, 'status', e.target.value)}
                          className={`border rounded-lg px-2 py-1 text-sm ${
                            darkMode 
                              ? 'bg-slate-700 text-white border-slate-600' 
                              : 'bg-white text-slate-800 border-slate-300'
                          }`}
                        >
                          <option>Pending</option>
                          <option>Paid</option>
                        </select>
                      </td>
                      <td className={`p-3 text-right text-sm font-medium ${
                        bill.daysUntilDue === 0 ? 'text-rose-500' :
                        bill.daysUntilDue <= 3 ? 'text-amber-500' :
                        darkMode ? 'text-slate-300' : 'text-slate-800'
                      }`}>
                        {bill.daysUntilDue}
                      </td>
                      <td className="p-3 text-right text-sm font-medium text-emerald-600">
                        {bill.allocationPercent.toFixed(1)}%
                      </td>
                      <td className="p-3 text-right text-sm font-semibold text-teal-600">
                        ${bill.allocatedAmount.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => deleteBill(bill.id)}
                          className="text-rose-600 hover:text-rose-800 transition"
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

        {/* Credit Cards Tab */}
        {activeTab === 'creditcards' && (
          <div className="space-y-6">
            {/* Credit Card Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
                darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-red-100'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="text-red-500" size={20} />
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Total Debt
                  </h3>
                </div>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  ${creditCardStats.totalDebt.toFixed(2)}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  Across {creditCards.filter(c => c.balance > 0).length} cards
                </p>
              </div>

              <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
                darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-amber-100'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <Percent className="text-amber-500" size={20} />
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Utilization
                  </h3>
                </div>
                <p className={`text-3xl font-bold ${
                  creditCardStats.utilizationRate > 80 ? 'text-red-600' :
                  creditCardStats.utilizationRate > 50 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {creditCardStats.utilizationRate.toFixed(1)}%
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  ${creditCardStats.totalDebt.toFixed(0)} / ${creditCardStats.totalCreditLimit.toFixed(0)}
                </p>
              </div>

              <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
                darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-rose-100'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="text-rose-500" size={20} />
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Min Payments
                  </h3>
                </div>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  ${creditCardStats.totalMinPayments.toFixed(2)}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  Per month
                </p>
              </div>

              <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
                darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-emerald-100'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingDown className="text-emerald-500" size={20} />
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Avg APR
                  </h3>
                </div>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  {creditCardStats.weightedAPR.toFixed(2)}%
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  Weighted by balance
                </p>
              </div>
            </div>

            {/* Credit Card Management */}
            <div className={`rounded-xl shadow-lg p-4 md:p-6 backdrop-blur-sm ${
              darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  💳 Credit Card Details
                </h2>
                <button
                  onClick={addCreditCard}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    darkMode 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/50' 
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-300'
                  }`}
                  disabled={creditCards.length >= 10}
                >
                  <Plus size={20} />
                  Add Card ({creditCards.length}/10)
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b-2 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                      <th className={`text-left p-3 font-semibold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Card Name
                      </th>
                      <th className={`text-right p-3 font-semibold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Balance
                      </th>
                      <th className={`text-right p-3 font-semibold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Credit Limit
                      </th>
                      <th className={`text-right p-3 font-semibold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Utilization
                      </th>
                      <th className={`text-right p-3 font-semibold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        APR %
                      </th>
                      <th className={`text-right p-3 font-semibold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Min Payment
                      </th>
                      <th className={`text-left p-3 font-semibold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Due Date
                      </th>
                      <th className={`text-center p-3 font-semibold text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCreditCards.map(card => {
                      const utilization = (card.balance / card.creditLimit) * 100;
                      return (
                        <tr key={card.id} className={`border-b transition-colors ${
                          darkMode 
                            ? 'border-slate-700 hover:bg-slate-700/50' 
                            : 'border-slate-100 hover:bg-slate-50'
                        }`}>
                          <td className="p-3">
                            <input
                              type="text"
                              value={card.name}
                              onChange={(e) => updateCreditCard(card.id, 'name', e.target.value)}
                              className={`border rounded-lg px-2 py-1 w-full text-sm ${
                                darkMode 
                                  ? 'bg-slate-700 text-white border-slate-600' 
                                  : 'bg-white text-slate-800 border-slate-300'
                              }`}
                            />
                          </td>
                          <td className="p-3 text-right">
                            <input
                              type="number"
                              step="0.01"
                              value={card.balance}
                              onChange={(e) => updateCreditCard(card.id, 'balance', Number(e.target.value))}
                              className={`border rounded-lg px-2 py-1 w-28 text-sm text-right ${
                                darkMode 
                                  ? 'bg-slate-700 text-white border-slate-600' 
                                  : 'bg-white text-slate-800 border-slate-300'
                              }`}
                            />
                          </td>
                          <td className="p-3 text-right">
                            <input
                              type="number"
                              step="100"
                              value={card.creditLimit}
                              onChange={(e) => updateCreditCard(card.id, 'creditLimit', Number(e.target.value))}
                              className={`border rounded-lg px-2 py-1 w-28 text-sm text-right ${
                                darkMode 
                                  ? 'bg-slate-700 text-white border-slate-600' 
                                  : 'bg-white text-slate-800 border-slate-300'
                              }`}
                            />
                          </td>
                          <td className={`p-3 text-right text-sm font-semibold ${
                            utilization > 80 ? 'text-red-600' :
                            utilization > 50 ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {utilization.toFixed(1)}%
                          </td>
                          <td className="p-3 text-right">
                            <input
                              type="number"
                              step="0.01"
                              value={card.apr}
                              onChange={(e) => updateCreditCard(card.id, 'apr', Number(e.target.value))}
                              className={`border rounded-lg px-2 py-1 w-20 text-sm text-right ${
                                darkMode 
                                  ? 'bg-slate-700 text-white border-slate-600' 
                                  : 'bg-white text-slate-800 border-slate-300'
                              }`}
                            />
                          </td>
                          <td className="p-3 text-right">
                            <input
                              type="number"
                              step="1"
                              value={card.minPayment}
                              onChange={(e) => updateCreditCard(card.id, 'minPayment', Number(e.target.value))}
                              className={`border rounded-lg px-2 py-1 w-24 text-sm text-right ${
                                darkMode 
                                  ? 'bg-slate-700 text-white border-slate-600' 
                                  : 'bg-white text-slate-800 border-slate-300'
                              }`}
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="date"
                              value={card.dueDate}
                              onChange={(e) => updateCreditCard(card.id, 'dueDate', e.target.value)}
                              className={`border rounded-lg px-2 py-1 text-sm ${
                                darkMode 
                                  ? 'bg-slate-700 text-white border-slate-600' 
                                  : 'bg-white text-slate-800 border-slate-300'
                              }`}
                            />
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => deleteCreditCard(card.id)}
                              className="text-rose-600 hover:text-rose-800 transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payoff Calculator */}
            <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
              darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'
            }`}>
              <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                📊 Payoff Insights
              </h3>
              <div className="space-y-4">
                {sortedCreditCards.filter(c => c.balance > 0).map(card => {
                  const monthlyInterest = (card.balance * (card.apr / 100)) / 12;
                  const monthsToPayoff = card.minPayment > monthlyInterest ? 
                    Math.ceil(Math.log(card.minPayment / (card.minPayment - monthlyInterest)) / Math.log(1 + (card.apr / 100 / 12))) : 999;
                  const totalInterest = (card.minPayment * monthsToPayoff) - card.balance;
                  
                  return (
                    <div key={card.id} className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                          {card.name}
                        </h4>
                        <span className={`text-sm font-medium ${
                          card.apr > 25 ? 'text-red-600' :
                          card.apr > 20 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {card.apr}% APR
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Balance</p>
                          <p className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                            ${card.balance.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Monthly Interest</p>
                          <p className="font-bold text-red-600">
                            ${monthlyInterest.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Payoff Time</p>
                          <p className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                            {monthsToPayoff === 999 ? '∞' : `${monthsToPayoff} months`}
                          </p>
                        </div>
                        <div>
                          <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Total Interest</p>
                          <p className="font-bold text-amber-600">
                            ${totalInterest > 0 ? totalInterest.toFixed(2) : '∞'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
            darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              📅 Calendar View
            </h2>
            <div className="space-y-3">
              {sortedBills.map(bill => (
                <div key={bill.id} className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border-l-4 transition-all hover:scale-[1.01] ${
                  bill.status === 'Paid' ? 'border-teal-500' : 
                  bill.daysUntilDue === 0 ? 'border-rose-500' :
                  bill.daysUntilDue <= 3 ? 'border-amber-500' : 'border-emerald-500'
                } ${
                  darkMode ? 'bg-slate-700/50' : 'bg-slate-50'
                }`}>
                  <div className={`px-4 py-3 rounded-xl text-center min-w-[80px] ${
                    bill.status === 'Paid' ? 'bg-teal-100' :
                    bill.daysUntilDue === 0 ? 'bg-rose-100' :
                    bill.daysUntilDue <= 3 ? 'bg-amber-100' : 'bg-emerald-100'
                  }`}>
                    <p className={`text-xs font-medium ${
                      bill.status === 'Paid' ? 'text-teal-600' :
                      bill.daysUntilDue === 0 ? 'text-rose-600' :
                      bill.daysUntilDue <= 3 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className={`text-2xl font-bold ${
                      bill.status === 'Paid' ? 'text-teal-600' :
                      bill.daysUntilDue === 0 ? 'text-rose-600' :
                      bill.daysUntilDue <= 3 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {new Date(bill.dueDate).getDate()}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {bill.name}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {bill.category} • {bill.daysUntilDue === 0 ? 'Due Today' : `${bill.daysUntilDue} days`}
                    </p>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      ${bill.amount.toFixed(2)}
                    </p>
                    <p className={`text-sm font-medium ${bill.status === 'Paid' ? 'text-teal-600' : 'text-amber-600'}`}>
                      {bill.status}
                    </p>
                  </div>
                  {bill.status === 'Pending' && (
                    <div className="text-left sm:text-right w-full sm:w-auto min-w-[100px]">
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Reserve Now
                      </p>
                      <p className="font-semibold text-emerald-600">${bill.allocatedAmount.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
              darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                📊 Spending by Category
              </h2>
              <div className="space-y-4">
                {categoryTotals.map(([category, total]) => {
                  const percentage = (total / dashboardStats.totalBills) * 100;
                  return (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          {category}
                        </span>
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                          ${total.toFixed(2)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className={`w-full h-3 rounded-full overflow-hidden ${
                        darkMode ? 'bg-slate-700' : 'bg-slate-200'
                      }`}>
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
                darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'
              }`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  📈 Budget Health
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                      Available Balance
                    </span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      ${availableBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                      Total Bills
                    </span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      ${dashboardStats.totalBills.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                      Credit Card Debt
                    </span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      ${creditCardStats.totalDebt.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-600">
                    <span className={`font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Net Position
                    </span>
                    <span className={`font-bold text-lg ${
                      availableBalance - dashboardStats.totalBills - creditCardStats.totalDebt >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      ${(availableBalance - dashboardStats.totalBills - creditCardStats.totalDebt).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
                darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'
              }`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  ⏱️ Payment Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                      Overdue Bills
                    </span>
                    <span className={`font-bold ${dashboardStats.overdueBills.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {dashboardStats.overdueBills.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                      Due Soon (≤3 days)
                    </span>
                    <span className={`font-bold ${dashboardStats.dueSoonBills.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {dashboardStats.dueSoonBills.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                      Pending Bills
                    </span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {dashboardStats.pendingCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                      Paid Bills
                    </span>
                    <span className="font-bold text-teal-600">
                      {dashboardStats.paidCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
              darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'
            }`}>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                💳 Credit Card Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <p className={`text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Monthly Interest (Estimated)
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    ${((creditCardStats.totalDebt * (creditCardStats.weightedAPR / 100)) / 12).toFixed(2)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <p className={`text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Annual Interest Cost
                  </p>
                  <p className="text-2xl font-bold text-rose-600">
                    ${(creditCardStats.totalDebt * (creditCardStats.weightedAPR / 100)).toFixed(2)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <p className={`text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Available Credit
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ${creditCardStats.availableCredit.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
              darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'
            }`}>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                💡 How It Works
              </h3>
              <div className={`space-y-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-emerald-50'}`}>
                  <h4 className="font-semibold mb-2">📋 Bill Allocation System</h4>
                  <p className="text-sm">
                    Bills are weighted based on urgency using the formula: weight = 1 / (days until due + 1). 
                    Your available balance is distributed proportionally, ensuring urgent bills get priority.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-cyan-50'}`}>
                  <h4 className="font-semibold mb-2">💳 Credit Utilization</h4>
                  <p className="text-sm">
                    Keep your credit utilization below 30% for optimal credit scores. High utilization (>80%) can 
                    negatively impact your credit rating.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-amber-50'}`}>
                  <h4 className="font-semibold mb-2">📊 Payoff Strategy</h4>
                  <p className="text-sm">
                    Pay more than the minimum to reduce interest costs. Consider the avalanche method (highest APR first) 
                    or snowball method (lowest balance first) to accelerate debt payoff.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiWeeklyBudget;