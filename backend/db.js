const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

// Initialize DB file if it doesn't exist
function initDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], tasks: [], settings: [] }, null, 2));
  }
}

function readDB() {
  initDB();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ── Users ──────────────────────────────────────────────────────────────────

const Users = {
  findOne(predicate) {
    const db = readDB();
    return db.users.find(predicate) || null;
  },
  findById(id) {
    const db = readDB();
    return db.users.find(u => u._id === id) || null;
  },
  create(data) {
    const db = readDB();
    const now = new Date().toISOString();
    const user = { _id: generateId(), ...data, createdAt: now, updatedAt: now };
    db.users.push(user);
    writeDB(db);
    return user;
  },
  save(user) {
    const db = readDB();
    const idx = db.users.findIndex(u => u._id === user._id);
    user.updatedAt = new Date().toISOString();
    if (idx !== -1) db.users[idx] = user;
    else db.users.push(user);
    writeDB(db);
    return user;
  }
};

// ── Tasks ──────────────────────────────────────────────────────────────────

const Tasks = {
  find(predicate) {
    const db = readDB();
    return db.tasks.filter(predicate).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  findById(id) {
    const db = readDB();
    return db.tasks.find(t => t._id === id) || null;
  },
  create(data) {
    const db = readDB();
    const now = new Date().toISOString();
    const task = {
      _id: generateId(),
      title: '',
      description: '',
      subject: '',
      date: '',
      dueDate: '',
      priority: 'Medium',
      completed: false,
      ...data,
      createdAt: now,
      updatedAt: now
    };
    db.tasks.push(task);
    writeDB(db);
    return task;
  },
  findOneAndUpdate(id, userId, updates) {
    const db = readDB();
    const idx = db.tasks.findIndex(t => t._id === id && t.user === userId);
    if (idx === -1) return null;
    db.tasks[idx] = { ...db.tasks[idx], ...updates, updatedAt: new Date().toISOString() };
    writeDB(db);
    return db.tasks[idx];
  },
  findOneAndDelete(id, userId) {
    const db = readDB();
    const idx = db.tasks.findIndex(t => t._id === id && t.user === userId);
    if (idx === -1) return null;
    const [deleted] = db.tasks.splice(idx, 1);
    writeDB(db);
    return deleted;
  }
};

// ── Settings ───────────────────────────────────────────────────────────────

const Settings = {
  findOne(userId) {
    const db = readDB();
    return db.settings.find(s => s.user === userId) || null;
  },
  create(userId, data = {}) {
    const db = readDB();
    const now = new Date().toISOString();
    const defaults = {
      reminders: true,
      notifications: true,
      studyGoal: '4 Hours',
      language: 'English (US)'
    };
    const settings = { _id: generateId(), ...defaults, ...data, user: userId, createdAt: now, updatedAt: now };
    db.settings.push(settings);
    writeDB(db);
    return settings;
  },
  save(settings) {
    const db = readDB();
    const idx = db.settings.findIndex(s => s._id === settings._id);
    settings.updatedAt = new Date().toISOString();
    if (idx !== -1) db.settings[idx] = settings;
    else db.settings.push(settings);
    writeDB(db);
    return settings;
  }
};

module.exports = { Users, Tasks, Settings };
