import React, { useState, useEffect } from 'react';
import logo from './assets/budgets-logo.png';
import { DollarSign, Calendar, TrendingUp, Plus, Trash2, Moon, Sun, AlertCircle, Clock, CreditCard, Percent, TrendingDown } from 'lucide-react';
import {
  getBills, createBill, updateBill as apiBill, deleteBill as apiDeleteBill,
  getDebts, createDebt, updateDebt as apiDebt, deleteDebt as apiDeleteDebt,
  getSetting, updateSetting
} from './api';
import Chat from './Chat';

const BiWeeklyBudget = () => {
  const [availableBalance, setAvailableBalance] = useState(0);
  const [nextPayDate, setNextPayDate] = useState('');
  const [darkMode, setDarkMode] = useState(() => typeof window !== 'undefined' && localStorage.getItem('darkMode') === 'true');
  const [bills, setBills] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getNextBiWeeklyPayDate = (referenceDateStr) => {
    const today = new Date();
    const ref = new Date(referenceDateStr);
    const normalize = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const todayNorm = normalize(today);
    const refNorm = normalize(ref);
    const msPerDay = 24 * 60 * 60 * 1000;
    const msPerBiWeek = 14 * msPerDay;
    const diff = todayNorm - refNorm;
    const cycle = diff <= 0 ? 0 : Math.ceil(diff / msPerBiWeek);
    const next = new Date(refNorm.getTime() + cycle * msPerBiWeek);
    return next.toISOString().split('T')[0];
  };

  // ─── Load all data from API on mount ─────────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [billsData, debtsData, balanceSetting, payDateSetting] = await Promise.all([
          getBills(),
          getDebts(),
          getSetting('available_balance'),
          getSetting('next_pay_date')
        ]);

        setBills(billsData.map(b => ({
          ...b,
          amount: parseFloat(b.amount),
          dueDate: b.due_date
        })));

        setCreditCards(debtsData.map(d => ({
          ...d,
          balance: parseFloat(d.current_balance),
          creditLimit: parseFloat(d.credit_limit),
          apr: parseFloat(d.interest_rate),
          minPayment: parseFloat(d.minimum_payment),
          dueDate: d.due_date
        })));

        setAvailableBalance(balanceSetting ? parseFloat(balanceSetting.value) : 0);
        setNextPayDate(payDateSetting ? payDateSetting.value : getNextBiWeeklyPayDate('2026-03-06'));

      } catch (err) {
        setError('Failed to load data. Is the server running?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ─── Settings sync ────────────────────────────────────────
  useEffect(() => {
    if (!loading) updateSetting('available_balance', availableBalance);
  }, [availableBalance, loading]);

  useEffect(() => {
    if (!loading && nextPayDate) updateSetting('next_pay_date', nextPayDate);
  }, [nextPayDate, loading]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // ─── Bills CRUD ───────────────────────────────────────────
  const addBill = async () => {
    if (bills.length >= 20) { alert('Maximum 20 bills reached'); return; }
    const today = new Date().toISOString().split('T')[0];
    try {
      const newBill = await createBill({
        name: 'New Bill',
        amount: 0,
        due_date: today,
        frequency: 'monthly',
        category: 'Other',
        status: 'Pending'
      });
      setBills(prev => [...prev, {
        ...newBill,
        amount: parseFloat(newBill.amount),
        dueDate: newBill.due_date
      }]);
    } catch (err) {
      console.error('Failed to add bill:', err);
    }
  };

  const deleteBill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    try {
      await apiDeleteBill(id);
      setBills(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Failed to delete bill:', err);
    }
  };

  const updateBill = async (id, field, value) => {
    const bill = bills.find(b => b.id === id);
    if (!bill) return;
    const updated = { ...bill, [field]: value };
    setBills(prev => prev.map(b => b.id === id ? updated : b));
    try {
      await apiBill(id, {
        name: updated.name,
        amount: updated.amount,
        due_date: updated.dueDate || updated.due_date,
        frequency: updated.frequency,
        category: updated.category,
        status: updated.status,
        notes: updated.notes
      });
    } catch (err) {
      console.error('Failed to update bill:', err);
    }
  };

  // ─── Debts CRUD ───────────────────────────────────────────
  const addCreditCard = async () => {
    if (creditCards.length >= 10) { alert('Maximum 10 credit cards reached'); return; }
    const today = new Date().toISOString().split('T')[0];
    try {
      const newDebt = await createDebt({
        name: 'New Credit Card',
        debt_type: 'credit_card',
        current_balance: 0,
        credit_limit: 1000,
        interest_rate: 18.00,
        minimum_payment: 0,
        due_date: today
      });
      setCreditCards(prev => [...prev, {
        ...newDebt,
        balance: parseFloat(newDebt.current_balance),
        creditLimit: parseFloat(newDebt.credit_limit),
        apr: parseFloat(newDebt.interest_rate),
        minPayment: parseFloat(newDebt.minimum_payment),
        dueDate: newDebt.due_date
      }]);
    } catch (err) {
      console.error('Failed to add credit card:', err);
    }
  };

  const deleteCreditCard = async (id) => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;
    try {
      await apiDeleteDebt(id);
      setCreditCards(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete credit card:', err);
    }
  };

  const updateCreditCard = async (id, field, value) => {
    const card = creditCards.find(c => c.id === id);
    if (!card) return;
    const updated = { ...card, [field]: value };
    setCreditCards(prev => prev.map(c => c.id === id ? updated : c));
    try {
      await apiDebt(id, {
        name: updated.name,
        debt_type: updated.debt_type || 'credit_card',
        current_balance: updated.balance,
        credit_limit: updated.creditLimit,
        interest_rate: updated.apr,
        minimum_payment: updated.minPayment,
        due_date: updated.dueDate
      });
    } catch (err) {
      console.error('Failed to update credit card:', err);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  // ─── Loading & Error states ───────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="text-4xl mb-4">💰</div>
          <p className="text-slate-600 text-lg">Loading your finances...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg">{error}</p>
          <p className="text-slate-500 mt-2">Check that your server is running on port 3001</p>
        </div>
      </div>
    );
  }

  // ─── All your existing computed values unchanged ──────────
  const calculateBillMetrics = bills.map(bill => {
    const daysUntilDue = Math.max(0, Math.ceil(
      (new Date(bill.dueDate || bill.due_date) - new Date(today)) / (1000 * 60 * 60 * 24)
    ));
    return { ...bill, daysUntilDue };
  });

  const totalWeight = calculateBillMetrics.reduce((sum, bill) => {
    if (bill.status === 'Pending') return sum + (1 / (bill.daysUntilDue + 1));
    return sum;
  }, 0);

  const billsWithAllocation = calculateBillMetrics.map(bill => {
    if (bill.status === 'Pending' && totalWeight > 0) {
      const weight = 1 / (bill.daysUntilDue + 1);
      const allocationPercent = (weight / totalWeight) * 100;
      const allocatedAmount = (availableBalance * allocationPercent) / 100;
      return { ...bill, allocationPercent, allocatedAmount };
    }
    return { ...bill, allocationPercent: 0, allocatedAmount: 0 };
  });

  const dashboardStats = (() => {
    const totalBills = bills.reduce((sum, b) => sum + (b.status === 'Pending' ? b.amount : 0), 0);
    const totalAllocated = billsWithAllocation.reduce((sum, b) => sum + (b.status === 'Pending' ? b.allocatedAmount : 0), 0);
    const remaining = availableBalance - totalAllocated;
    const paidCount = bills.filter(b => b.status === 'Paid').length;
    const pendingCount = bills.filter(b => b.status === 'Pending').length;
    const overdueBills = billsWithAllocation.filter(b => b.status === 'Pending' && new Date(b.dueDate || b.due_date) < new Date(today));
    const dueSoonBills = billsWithAllocation.filter(b => b.status === 'Pending' && b.daysUntilDue <= 3 && b.daysUntilDue > 0);
    return { totalBills, totalAllocated, remaining, paidCount, pendingCount, overdueBills, dueSoonBills };
  })();

  const creditCardStats = (() => {
    const totalDebt = creditCards.reduce((sum, card) => sum + card.balance, 0);
    const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.creditLimit, 0);
    const totalMinPayments = creditCards.reduce((sum, card) => sum + card.minPayment, 0);
    const utilizationRate = totalCreditLimit > 0 ? (totalDebt / totalCreditLimit) * 100 : 0;
    const weightedAPR = creditCards.reduce((sum, card) => sum + (card.apr * card.balance), 0) / totalDebt || 0;
    return { totalDebt, totalCreditLimit, totalMinPayments, utilizationRate, weightedAPR, availableCredit: totalCreditLimit - totalDebt };
  })();

  const sortedBillsByDate = [...billsWithAllocation].sort((a, b) =>
    new Date(a.dueDate || a.due_date) - new Date(b.dueDate || b.due_date)
  );

  const getBillGroup = (bill) => {
    const cat = (bill.category || '').toLowerCase();
    if (cat === 'utilities') return 'Utilities';
    if (cat === 'entertainment') return 'Entertainment';
    if (['credit card', 'creditcard', 'loan', 'debt'].includes(cat)) return 'Debt';
    return 'Other';
  };

  const sortedBillsByGroup = (() => {
    const groupOrder = ['Utilities', 'Entertainment', 'Debt', 'Other'];
    const groups = groupOrder.reduce((acc, name) => ({ ...acc, [name]: [] }), {});
    billsWithAllocation.forEach(bill => {
      groups[getBillGroup(bill)].push(bill);
    });
    return groupOrder
      .map(groupName => ({
        groupName,
        bills: groups[groupName].sort((a, b) =>
          new Date(a.dueDate || a.due_date) - new Date(b.dueDate || b.due_date)
        )
      }))
      .filter(group => group.bills.length > 0);
  })();

  const sortedCreditCards = [...creditCards].sort((a, b) =>
    new Date(a.dueDate) - new Date(b.dueDate)
  );

  const categoryTotals = (() => {
    const totals = {};
    bills.forEach(bill => {
      if (bill.status === 'Pending') {
        totals[bill.category] = (totals[bill.category] || 0) + bill.amount;
      }
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  })();

  const calendarMeta = (() => {
    const start = new Date(today);
    start.setDate(1);
    const leadingEmpty = start.getDay();
    const days = Array.from({ length: 30 }).map((_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
    const billsByDate = sortedBillsByDate.reduce((acc, bill) => {
      const key = bill.dueDate || bill.due_date;
      acc[key] = acc[key] ? [...acc[key], bill] : [bill];
      return acc;
    }, {});
    return { start, leadingEmpty, days, billsByDate };
  })();

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div className={`min-h-screen p-4 md:p-6 transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-12 w-12 rounded-xl bg-white/10 p-2 shadow-sm" />
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
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-xl transition-all shadow-lg ${
              darkMode 
                ? 'bg-slate-700 hover:bg-slate-600 text-amber-400' 
                : 'bg-white hover:bg-slate-50 text-slate-700 shadow-emerald-200'
            }`}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </header>

        {/* Alerts */}
        {(dashboardStats.overdueBills.length > 0 || dashboardStats.dueSoonBills.length > 0 || creditCardStats.utilizationRate > 80) && (
          <div className="mb-6 space-y-2">
            {dashboardStats.overdueBills.length > 0 && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400">
                    {dashboardStats.overdueBills.length} Overdue Bill{dashboardStats.overdueBills.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-red-600">
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
                    {dashboardStats.dueSoonBills.length} Bill{dashboardStats.dueSoonBills.length > 1 ? 's' : ''} Due Soon
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
                    Consider paying down your credit cards
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
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
                      darkMode ? 'bg-slate-800 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'
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
                      darkMode ? 'bg-slate-800 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <TrendingUp className="text-rose-500" size={20} />, label: 'Total Bills Due', value: `$${dashboardStats.totalBills.toFixed(2)}`, sub: `${dashboardStats.pendingCount} pending`, border: 'border-rose-100' },
                { icon: <DollarSign className="text-amber-500" size={20} />, label: 'Allocated Now', value: `$${dashboardStats.totalAllocated.toFixed(2)}`, sub: `${((dashboardStats.totalAllocated / dashboardStats.totalBills) * 100 || 0).toFixed(1)}% of total`, border: 'border-amber-100' },
                { icon: <DollarSign className="text-emerald-500" size={20} />, label: 'Remaining', value: `$${dashboardStats.remaining.toFixed(2)}`, sub: 'After allocation', border: 'border-emerald-100', valueClass: dashboardStats.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600' },
                { icon: <CreditCard className="text-red-500" size={20} />, label: 'CC Debt', value: `$${creditCardStats.totalDebt.toFixed(2)}`, sub: `Min: $${creditCardStats.totalMinPayments}/mo`, border: 'border-red-100' },
              ].map((stat, i) => (
                <div key={i} className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${darkMode ? 'bg-slate-800/80 border border-slate-700' : `bg-white/90 border ${stat.border}`}`}>
                  <div className="flex items-center gap-3 mb-2">
                    {stat.icon}
                    <h3 className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{stat.label}</h3>
                  </div>
                  <p className={`text-3xl font-bold ${stat.valueClass || (darkMode ? 'text-white' : 'text-slate-800')}`}>{stat.value}</p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Upcoming Bills */}
            <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${
              darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'
            }`}>
              <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                📅 Upcoming Bills (Next 7)
              </h3>
              <div className="space-y-3">
                {sortedBillsByDate.filter(b => b.status === 'Pending').slice(0, 7).map(bill => (
                  <div key={bill.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg transition-all hover:scale-[1.02] ${
                    darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                  } ${bill.daysUntilDue === 0 ? 'border-l-4 border-rose-500' : bill.daysUntilDue <= 3 ? 'border-l-4 border-amber-500' : ''}`}>
                    <div className="mb-2 sm:mb-0">
                      <p className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>{bill.name}</p>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Due: {new Date(bill.dueDate || bill.due_date).toLocaleDateString()}
                        <span className={`ml-2 font-medium ${bill.daysUntilDue === 0 ? 'text-rose-500' : bill.daysUntilDue <= 3 ? 'text-amber-500' : darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          ({bill.daysUntilDue === 0 ? 'Today!' : `${bill.daysUntilDue} days`})
                        </span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>${bill.amount.toFixed(2)}</p>
                      <p className="text-sm text-emerald-600 font-medium">Reserve: ${bill.allocatedAmount.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bills Tab */}
        {activeTab === 'bills' && (
          <div className={`rounded-xl shadow-lg p-4 md:p-6 backdrop-blur-sm ${
            darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>📋 Bills Management</h2>
              <button onClick={addBill} disabled={bills.length >= 20}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
                <Plus size={20} /> Add Bill ({bills.length}/20)
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b-2 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    {['Due Date', 'Bill Name', 'Category', 'Amount', 'Status', 'Days', 'Alloc %', 'Allocated $', 'Delete'].map((h, i) => (
                      <th key={i} className={`p-3 font-semibold text-sm ${i >= 3 ? 'text-right' : 'text-left'} ${i === 8 ? 'text-center' : ''} ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedBillsByGroup.map(group => (
                    <React.Fragment key={group.groupName}>
                      <tr className={`border-b ${darkMode ? 'border-slate-700 bg-slate-700/40' : 'border-slate-200 bg-slate-100'}`}>
                        <td colSpan={9} className={`px-3 py-2 font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{group.groupName}</td>
                      </tr>
                      {group.bills.map(bill => (
                        <tr key={bill.id} className={`border-b transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                          <td className="p-3">
                            <input type="date" value={bill.dueDate || bill.due_date || ''}
                              onChange={(e) => updateBill(bill.id, 'dueDate', e.target.value)}
                              className={`border rounded-lg px-2 py-1 text-sm ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'}`} />
                          </td>
                          <td className="p-3">
                            <input type="text" value={bill.name}
                              onChange={(e) => updateBill(bill.id, 'name', e.target.value)}
                              className={`border rounded-lg px-2 py-1 w-full text-sm ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'}`} />
                          </td>
                          <td className="p-3">
                            <input type="text" value={bill.category || ''}
                              onChange={(e) => updateBill(bill.id, 'category', e.target.value)}
                              className={`border rounded-lg px-2 py-1 w-full text-sm ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'}`} />
                          </td>
                          <td className="p-3 text-right">
                            <input type="number" step="0.01" value={bill.amount}
                              onChange={(e) => updateBill(bill.id, 'amount', Number(e.target.value))}
                              className={`border rounded-lg px-2 py-1 w-24 text-sm text-right ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'}`} />
                          </td>
                          <td className="p-3">
                            <select value={bill.status} onChange={(e) => updateBill(bill.id, 'status', e.target.value)}
                              className={`border rounded-lg px-2 py-1 text-sm ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'}`}>
                              <option>Pending</option>
                              <option>Paid</option>
                            </select>
                          </td>
                          <td className={`p-3 text-right text-sm font-medium ${bill.daysUntilDue === 0 ? 'text-rose-500' : bill.daysUntilDue <= 3 ? 'text-amber-500' : darkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                            {bill.daysUntilDue}
                          </td>
                          <td className="p-3 text-right text-sm font-medium text-emerald-600">{bill.allocationPercent.toFixed(1)}%</td>
                          <td className="p-3 text-right text-sm font-semibold text-teal-600">${bill.allocatedAmount.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <button onClick={() => deleteBill(bill.id)} className="text-rose-600 hover:text-rose-800 transition">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Credit Cards Tab */}
        {activeTab === 'creditcards' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <CreditCard className="text-red-500" size={20} />, label: 'Total Debt', value: `$${creditCardStats.totalDebt.toFixed(2)}`, sub: `Across ${creditCards.filter(c => c.balance > 0).length} cards`, border: 'border-red-100' },
                { icon: <Percent className="text-amber-500" size={20} />, label: 'Utilization', value: `${creditCardStats.utilizationRate.toFixed(1)}%`, sub: `$${creditCardStats.totalDebt.toFixed(0)} / $${creditCardStats.totalCreditLimit.toFixed(0)}`, border: 'border-amber-100', valueClass: creditCardStats.utilizationRate > 80 ? 'text-red-600' : creditCardStats.utilizationRate > 50 ? 'text-amber-600' : 'text-emerald-600' },
                { icon: <DollarSign className="text-rose-500" size={20} />, label: 'Min Payments', value: `$${creditCardStats.totalMinPayments.toFixed(2)}`, sub: 'Per month', border: 'border-rose-100' },
                { icon: <TrendingDown className="text-emerald-500" size={20} />, label: 'Avg APR', value: `${creditCardStats.weightedAPR.toFixed(2)}%`, sub: 'Weighted by balance', border: 'border-emerald-100' },
              ].map((stat, i) => (
                <div key={i} className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${darkMode ? 'bg-slate-800/80 border border-slate-700' : `bg-white/90 border ${stat.border}`}`}>
                  <div className="flex items-center gap-3 mb-2">{stat.icon}<h3 className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{stat.label}</h3></div>
                  <p className={`text-3xl font-bold ${stat.valueClass || (darkMode ? 'text-white' : 'text-slate-800')}`}>{stat.value}</p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>{stat.sub}</p>
                </div>
              ))}
            </div>

            <div className={`rounded-xl shadow-lg p-4 md:p-6 backdrop-blur-sm ${darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>💳 Credit Card Details</h2>
                <button onClick={addCreditCard} disabled={creditCards.length >= 10}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
                  <Plus size={20} /> Add Card ({creditCards.length}/10)
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b-2 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                      {['Card Name', 'Balance', 'Credit Limit', 'Utilization', 'APR %', 'Min Payment', 'Due Date', 'Delete'].map((h, i) => (
                        <th key={i} className={`p-3 font-semibold text-sm ${i === 0 ? 'text-left' : i === 7 ? 'text-center' : 'text-right'} ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCreditCards.map(card => {
                      const utilization = (card.balance / card.creditLimit) * 100;
                      return (
                        <tr key={card.id} className={`border-b transition-colors ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                          <td className="p-3">
                            <input type="text" value={card.name} onChange={(e) => updateCreditCard(card.id, 'name', e.target.value)}
                              className={`border rounded-lg px-2 py-1 w-full text-sm ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'}`} />
                          </td>
                          <td className="p-3 text-right">
                            <input type="number" step="0.01" value={card.balance} onChange={(e) => updateCreditCard(card.id, 'balance', Number(e.target.value))}
                              className={`border rounded-lg px-2 py-1 w-28 text-sm text-right ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'}`} />
                          </td>
                          <td className="p-3 text-right">
                            <input type="number" step="100" value={card.creditLimit} onChange={(e) => updateCreditCard(card.id, 'creditLimit', Number(e.target.value))}
                              className={`border rounded-lg px-2 py-1 w-28 text-sm text-right ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'}`} />
                          </td>
                          <td className={`p-3 text-right text-sm font-semibold ${utilization > 80 ? 'text-red-600' : utilization > 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {utilization.toFixed(1)}%
                          </td>
                          <td className="p-3 text-right">
                            <input type="number" step="0.01" value={card.apr} onChange={(e) => updateCreditCard(card.id, 'apr', Number(e.target.value))}
                              className={`border rounded-lg px-2 py-1 w-20 text-sm text-right ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'}`} />
                          </td>
                          <td className="p-3 text-right">
                            <input type="number" step="1" value={card.minPayment} onChange={(e) => updateCreditCard(card.id, 'minPayment', Number(e.target.value))}
                              className={`border rounded-lg px-2 py-1 w-24 text-sm text-right ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'}`} />
                          </td>
                          <td className="p-3">
                            <input type="date" value={card.dueDate || ''} onChange={(e) => updateCreditCard(card.id, 'dueDate', e.target.value)}
                              className={`border rounded-lg px-2 py-1 text-sm ${darkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'}`} />
                          </td>
                          <td className="p-3 text-center">
                            <button onClick={() => deleteCreditCard(card.id)} className="text-rose-600 hover:text-rose-800 transition">
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
            <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'}`}>
              <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>📊 Payoff Insights</h3>
              <div className="space-y-4">
                {sortedCreditCards.filter(c => c.balance > 0).map(card => {
                  const monthlyInterest = (card.balance * (card.apr / 100)) / 12;
                  const monthsToPayoff = card.minPayment > monthlyInterest ?
                    Math.ceil(Math.log(card.minPayment / (card.minPayment - monthlyInterest)) / Math.log(1 + (card.apr / 100 / 12))) : 999;
                  const totalInterest = (card.minPayment * monthsToPayoff) - card.balance;
                  return (
                    <div key={card.id} className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{card.name}</h4>
                        <span className={`text-sm font-medium ${card.apr > 25 ? 'text-red-600' : card.apr > 20 ? 'text-amber-600' : 'text-emerald-600'}`}>{card.apr}% APR</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        {[
                          { label: 'Balance', value: `$${card.balance.toFixed(2)}`, cls: darkMode ? 'text-white' : 'text-slate-800' },
                          { label: 'Monthly Interest', value: `$${monthlyInterest.toFixed(2)}`, cls: 'text-red-600' },
                          { label: 'Payoff Time', value: monthsToPayoff === 999 ? '∞' : `${monthsToPayoff} months`, cls: darkMode ? 'text-white' : 'text-slate-800' },
                          { label: 'Total Interest', value: totalInterest > 0 ? `$${totalInterest.toFixed(2)}` : '∞', cls: 'text-amber-600' },
                        ].map((item, i) => (
                          <div key={i}>
                            <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>{item.label}</p>
                            <p className={`font-bold ${item.cls}`}>{item.value}</p>
                          </div>
                        ))}
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
          <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>📅 Calendar View</h2>
              <div className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Showing 30 days from {calendarMeta.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-7 gap-2 text-center mb-2">
                {weekDays.map(day => (
                  <div key={day} className={`text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: calendarMeta.leadingEmpty }).map((_, idx) => (
                  <div key={`blank-${idx}`} className="h-28 rounded-xl" />
                ))}
                {calendarMeta.days.map(day => {
                  const dateKey = day.toISOString().split('T')[0];
                  const dayBills = calendarMeta.billsByDate[dateKey] || [];
                  const isToday = dateKey === today;
                  return (
                    <div key={dateKey} className={`h-28 p-2 rounded-xl border transition flex flex-col justify-between ${
                      isToday ? 'border-emerald-500 bg-emerald-50' : darkMode ? 'border-slate-700 bg-slate-700/50' : 'border-slate-200 bg-white'
                    }`}>
                      <div className="flex items-start justify-between">
                        <span className={`text-sm font-semibold ${isToday ? 'text-emerald-700' : darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{day.getDate()}</span>
                        {dayBills.length > 0 && <span className="text-xs font-medium text-amber-500">{dayBills.length}</span>}
                      </div>
                      <div className="space-y-1 text-xs overflow-hidden">
                        {dayBills.slice(0, 3).map(bill => (
                          <div key={bill.id} className={`truncate rounded-full px-2 py-0.5 ${
                            bill.status === 'Paid' ? 'bg-teal-600 text-white' :
                            bill.daysUntilDue === 0 ? 'bg-rose-500 text-white' :
                            bill.daysUntilDue <= 3 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                          }`}>{bill.name}</div>
                        ))}
                        {dayBills.length > 3 && <div className={`text-[10px] ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>+{dayBills.length - 3} more</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'}`}>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>📊 Spending by Category</h2>
              <div className="space-y-4">
                {categoryTotals.map(([category, total]) => {
                  const percentage = (total / dashboardStats.totalBills) * 100;
                  return (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{category}</span>
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>${total.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className={`w-full h-3 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'}`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>📈 Budget Health</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Available Balance', value: `$${availableBalance.toFixed(2)}` },
                    { label: 'Total Bills', value: `$${dashboardStats.totalBills.toFixed(2)}` },
                    { label: 'Credit Card Debt', value: `$${creditCardStats.totalDebt.toFixed(2)}` },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{item.label}</span>
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{item.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-600">
                    <span className={`font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Net Position</span>
                    <span className={`font-bold text-lg ${availableBalance - dashboardStats.totalBills - creditCardStats.totalDebt >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ${(availableBalance - dashboardStats.totalBills - creditCardStats.totalDebt).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'}`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>⏱️ Payment Timeline</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Overdue Bills', value: dashboardStats.overdueBills.length, cls: dashboardStats.overdueBills.length > 0 ? 'text-rose-600' : 'text-emerald-600' },
                    { label: 'Due Soon (≤3 days)', value: dashboardStats.dueSoonBills.length, cls: dashboardStats.dueSoonBills.length > 0 ? 'text-amber-600' : 'text-emerald-600' },
                    { label: 'Pending Bills', value: dashboardStats.pendingCount, cls: darkMode ? 'text-white' : 'text-slate-800' },
                    { label: 'Paid Bills', value: dashboardStats.paidCount, cls: 'text-teal-600' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{item.label}</span>
                      <span className={`font-bold ${item.cls}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`rounded-xl shadow-lg p-6 backdrop-blur-sm ${darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'}`}>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>💳 Credit Card Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Monthly Interest (Est.)', value: `$${((creditCardStats.totalDebt * (creditCardStats.weightedAPR / 100)) / 12).toFixed(2)}`, cls: 'text-red-600' },
                  { label: 'Annual Interest Cost', value: `$${(creditCardStats.totalDebt * (creditCardStats.weightedAPR / 100)).toFixed(2)}`, cls: 'text-rose-600' },
                  { label: 'Available Credit', value: `$${creditCardStats.availableCredit.toFixed(2)}`, cls: 'text-emerald-600' },
                ].map((item, i) => (
                  <div key={i} className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <p className={`text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.label}</p>
                    <p className={`text-2xl font-bold ${item.cls}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Floating Chat */}
        <Chat darkMode={darkMode} />
      </div>
    </div>
  );
};

export default BiWeeklyBudget;