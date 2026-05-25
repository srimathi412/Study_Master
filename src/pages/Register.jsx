// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await register(form);
    if (result.success) navigate("/dashboard");
    else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="glass-card p-10 bg-white border-white shadow-2xl shadow-indigo-100">
          <h2 className="text-3xl font-bold text-slate-800 mb-2 font-['Outfit']">Create Account</h2>
          <p className="text-slate-500 mb-8 font-medium">Start your journey with StudyMaster</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" size={18} />
                <input name="name" type="text" value={form.name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500/30 pl-12 pr-4 py-4 rounded-2xl text-slate-800 outline-none transition-all font-bold" placeholder="John Doe" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" size={18} />
                <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500/30 pl-12 pr-4 py-4 rounded-2xl text-slate-800 outline-none transition-all font-bold" placeholder="name@study.com" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" size={18} />
                <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500/30 pl-12 pr-4 py-4 rounded-2xl text-slate-800 outline-none transition-all font-bold" placeholder="••••••••" required />
              </div>
            </div>

            {error && <p className="text-xs font-bold text-rose-500 bg-rose-50 p-3 rounded-xl">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2 shadow-xl shadow-indigo-100">
              {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign Up <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="font-bold text-slate-500">Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
