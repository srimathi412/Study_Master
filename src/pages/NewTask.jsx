// src/pages/NewTask.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addTask } from '../utils/api';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiTag, FiAlignLeft } from 'react-icons/fi';
import Card, { CardContent } from '../components/UI/Card';

export default function NewTask() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    subject: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('A task title is essential!');
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        ...formData,
        id: Date.now().toString(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      await addTask(taskData);
      navigate('/tasks');
    } catch (err) {
      setError('Something went wrong. Let\'s try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-all"
          >
            <FiArrowLeft size={18} /> Back
          </button>
          <div className="text-right">
            <h1 className="text-3xl font-['Outfit'] font-bold text-slate-800">Create Task</h1>
            <p className="text-slate-500 font-medium tracking-tight">Add a new goal to your list</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-xl text-sm font-bold shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-2xl shadow-indigo-500/10">
            <CardContent className="space-y-8 p-10">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                  <FiTag className="text-indigo-500" /> Task Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Complete Advanced Calculus Assignment"
                  className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white px-5 py-4 rounded-2xl outline-none transition-all font-bold text-lg text-slate-800 placeholder:text-slate-400"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                  <FiAlignLeft className="text-indigo-500" /> Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Add details about your task..."
                  className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white px-5 py-4 rounded-2xl outline-none transition-all font-medium text-slate-700 resize-none placeholder:text-slate-400"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Math, CS..."
                    className="w-full bg-slate-50 border-none px-4 py-3 rounded-xl outline-none font-bold text-slate-700 placeholder:text-slate-400"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    className="w-full bg-slate-50 border-none px-4 py-3 rounded-xl outline-none font-bold text-slate-700"
                    value={formData.dueDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Priority</label>
                  <select
                    name="priority"
                    className="w-full bg-slate-50 border-none px-4 py-3 rounded-xl outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-3 py-5 shadow-xl shadow-indigo-100"
                >
                  {loading ? <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><FiPlus size={20} /> Create Task</>}
                </button>
              </div>
            </CardContent>
          </Card>
        </form>
      </motion.div>
    </div>
  );
}
