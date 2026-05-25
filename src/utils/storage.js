// src/utils/storage.js

// Base storage functions
const storage = {
  set: (key, data) => {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const serializedData = localStorage.getItem(key);
      return serializedData ? JSON.parse(serializedData) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

/* ===========================
   USER (REGISTERED USER)
=========================== */

export const saveUser = (user) => {
  const users = storage.get('users', {});
  users[user.email] = user;
  storage.set('users', users);
  storage.set('currentUser', user.email);
};

export const getUser = (email) => {
  const users = storage.get('users', {});
  return users[email] || null;
};

export const updatePassword = (email, oldPassword, newPassword) => {
  const users = storage.get('users', {});
  const user = users[email];

  if (!user || user.password !== oldPassword) {
    return { success: false, message: "Incorrect current password." };
  }

  users[email] = { ...user, password: newPassword };
  storage.set('users', users);

  // If this is the current user in session, update session too
  const session = storage.get('session');
  if (session && session.email === email) {
    storage.set('session', { ...session, password: newPassword });
  }

  return { success: true, message: "Password updated successfully!" };
};

/* ===========================
   AUTH SESSION
=========================== */

export const setSession = (user) => {
  storage.set('session', user);
};

export const getSession = () => {
  return storage.get('session', null);
};

export const clearSession = () => {
  storage.remove('session');
};

/* ===========================
   TASKS (EMAIL BASED)
=========================== */

export const getTasks = (email) => {
  const tasks = storage.get('tasks', {});
  return tasks[email] || [];
};

export const saveTasks = (email, tasks) => {
  const allTasks = storage.get('tasks', {});
  allTasks[email] = tasks;
  storage.set('tasks', allTasks);
};

export const addTask = (email, task) => {
  const tasks = getTasks(email);
  const newTask = { ...task, id: Date.now().toString() };
  saveTasks(email, [...tasks, newTask]);
  return newTask;
};

export const updateTask = (email, taskId, updates) => {
  const tasks = getTasks(email);
  const updatedTasks = tasks.map(task =>
    task.id === taskId ? { ...task, ...updates } : task
  );
  saveTasks(email, updatedTasks);
  return updatedTasks.find(task => task.id === taskId);
};

export const deleteTask = (email, taskId) => {
  const tasks = getTasks(email);
  const updatedTasks = tasks.filter(task => task.id !== taskId);
  saveTasks(email, updatedTasks);
  return true;
};

/* ===========================
   SETTINGS
=========================== */

export const getSettings = (email) => {
  return storage.get(`settings_${email}`, {
    reminders: true,
    notifications: true,
    studyGoal: "4 Hours",
    language: "English (US)"
  });
};

export const saveSettings = (email, settings) => {
  storage.set(`settings_${email}`, settings);
};

// Initialize default data if needed
const initializeDefaultData = () => {
  const initialized = storage.get('initialized');
  if (!initialized) {
    // Add sample tasks for demo
    const sampleTasks = [
      {
        id: '1',
        title: 'Complete Math Assignment',
        subject: 'Math',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: false
      },
      {
        id: '2',
        title: 'Read Science Chapter',
        subject: 'Science',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: true
      }
    ];

    // Create a demo user
    const demoUser = {
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'password123' // In a real app, this would be hashed
    };

    saveUser(demoUser);
    saveTasks(demoUser.email, sampleTasks);
    storage.set('initialized', true);
  }
};

// Initialize data when the module loads
initializeDefaultData();
