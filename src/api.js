// Final API client for frontend to interact with backend
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// ─── Bills ───────────────────────────────────────────────
export const getBills = async () => {
  const res = await fetch(`${BASE_URL}/api/bills`);
  if (!res.ok) throw new Error('Failed to fetch bills');
  return res.json();
};

export const createBill = async (bill) => {
  const res = await fetch(`${BASE_URL}/api/bills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bill)
  });
  if (!res.ok) throw new Error('Failed to create bill');
  return res.json();
};

export const updateBill = async (id, bill) => {
  const res = await fetch(`${BASE_URL}/api/bills/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bill)
  });
  if (!res.ok) throw new Error('Failed to update bill');
  return res.json();
};

export const deleteBill = async (id) => {
  const res = await fetch(`${BASE_URL}/api/bills/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete bill');
  return res.json();
};

// ─── Debts ───────────────────────────────────────────────
export const getDebts = async () => {
  const res = await fetch(`${BASE_URL}/api/debts`);
  if (!res.ok) throw new Error('Failed to fetch debts');
  return res.json();
};

export const createDebt = async (debt) => {
  const res = await fetch(`${BASE_URL}/api/debts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(debt)
  });
  if (!res.ok) throw new Error('Failed to create debt');
  return res.json();
};

export const updateDebt = async (id, debt) => {
  const res = await fetch(`${BASE_URL}/api/debts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(debt)
  });
  if (!res.ok) throw new Error('Failed to update debt');
  return res.json();
};

export const deleteDebt = async (id) => {
  const res = await fetch(`${BASE_URL}/api/debts/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete debt');
  return res.json();
};

// ─── Settings ─────────────────────────────────────────────
export const getSetting = async (key) => {
  const res = await fetch(`${BASE_URL}/api/settings/${key}`);
  if (!res.ok) throw new Error(`Failed to fetch setting: ${key}`);
  return res.json();
};

export const updateSetting = async (key, value) => {
  const res = await fetch(`${BASE_URL}/api/settings/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: String(value) })
  });
  if (!res.ok) throw new Error(`Failed to update setting: ${key}`);
  return res.json();
};

// ─── Chat ────────────────────────────────────────────────
export const sendMessage = async (message) => {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
};

export const getModels = async () => {
  const res = await fetch(`${BASE_URL}/api/chat/models`);
  if (!res.ok) throw new Error('Failed to fetch models');
  return res.json();
};

export const switchModel = async (model) => {
  const res = await fetch(`${BASE_URL}/api/chat/model`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model })
  });
  if (!res.ok) throw new Error('Failed to switch model');
  return res.json();
};