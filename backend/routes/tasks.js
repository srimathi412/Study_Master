const express = require('express');
const router = express.Router();
const { Tasks } = require('../db');
const auth = require('../middleware/auth');

// GET /api/tasks
router.get('/', auth, (req, res) => {
  try {
    const tasks = Tasks.find(t => t.user === req.user.id);
    res.json(tasks);
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tasks
router.post('/', auth, (req, res) => {
  try {
    const task = Tasks.create({ ...req.body, user: req.user.id });
    res.status(201).json(task);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', auth, (req, res) => {
  try {
    const task = Tasks.findOneAndUpdate(req.params.id, req.user.id, req.body);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', auth, (req, res) => {
  try {
    const task = Tasks.findOneAndDelete(req.params.id, req.user.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
