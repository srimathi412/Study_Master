const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

/* ===========================
   AUTH
=========================== */

export const registerUser = async (user) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Registration failed');
  }
  const data = await res.json();
  localStorage.setItem('token', data.token);
  return data.user;
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Login failed');
  }
  const data = await res.json();
  localStorage.setItem('token', data.token);
  return data.user;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('session'); // Keep this if used for fast local checks
};

export const updatePassword = async (oldPassword, newPassword) => {
  const res = await fetch(`${API_URL}/auth/password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ oldPassword, newPassword })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Password update failed');
  }
  return res.json();
};

/* ===========================
   TASKS
=========================== */

export const getTasks = async () => {
  const res = await fetch(`${API_URL}/tasks`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
};

export const addTask = async (task) => {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(task)
  });
  if (!res.ok) throw new Error('Failed to add task');
  return res.json();
};

export const updateTask = async (taskId, updates) => {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
};

export const deleteTask = async (taskId) => {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete task');
  return res.json();
};

/* ===========================
   SETTINGS
=========================== */

export const getSettings = async () => {
  const res = await fetch(`${API_URL}/settings`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
};

export const saveSettings = async (settings) => {
  const res = await fetch(`${API_URL}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Failed to save settings');
  return res.json();
};
